package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Flight struct {
	ID      string `json:"id"`
	Number  string `json:"number"`
	Airline string `json:"airline"`
	From    string `json:"from"`
	To      string `json:"to"`
	Time    string `json:"time"`
	Date    string `json:"date"`
	Status  string `json:"status"`
}

var (
	flights = []Flight{
		{
			ID:      "1",
			Number:  "S7 123",
			Airline: "S7 Airlines",
			From:    "SKY",
			To:      "SVO",
			Time:    "14:30",
			Date:    time.Now().Format("2006-01-02"),
			Status:  "scheduled",
		},
		{
			ID:      "2",
			Number:  "SU 456",
			Airline: "Aeroflot",
			From:    "SKY",
			To:      "LED",
			Time:    "15:45",
			Date:    time.Now().Format("2006-01-02"),
			Status:  "boarding",
		},
		{
			ID:      "3",
			Number:  "TK 789",
			Airline: "Turkish Airlines",
			From:    "SKY",
			To:      "IST",
			Time:    "16:20",
			Date:    time.Now().Format("2006-01-02"),
			Status:  "delayed",
		},
	}
	flightsMutex = &sync.RWMutex{}
)

func main() {
	host := os.Getenv("HOST")
	if host == "" {
		host = "0.0.0.0"
	}
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := fmt.Sprintf("%s:%s", host, port)
	
	// Получаем локальные IP адреса
	localIPs := getLocalIPs()
	
	log.Println("✅ SKYFLOW Backend запущен!")
	log.Println("📍 Сервер запущен на:", addr)
	log.Println("🌐 Доступные IP адреса:")
	for _, ip := range localIPs {
		log.Printf("   - http://%s:%s", ip, port)
	}
	log.Println("📱 Для доступа с телефона:")
	log.Println("   - Узнайте IP компьютера в сети Wi-Fi")
	log.Println("   - Используйте: http://ВАШ-IP:3000")
	log.Println("📊 API: http://localhost:8080/api/flights")
	log.Println("🔐 Логин админа: admin / 0000")

	// Разрешаем CORS
	corsMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			
			next(w, r)
		}
	}

	// Получить все рейсы
	http.HandleFunc("/api/flights", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		flightsMutex.RLock()
		json.NewEncoder(w).Encode(flights)
		flightsMutex.RUnlock()
	}))

	// Добавить рейс
	http.HandleFunc("/api/flights/add", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			Number  string `json:"number"`
			Airline string `json:"airline"`
			From    string `json:"from"`
			To      string `json:"to"`
			Time    string `json:"time"`
			Status  string `json:"status"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
			return
		}

		var flightTime, flightDate string
		
		if strings.Contains(req.Time, "T") {
			parts := strings.Split(req.Time, "T")
			if len(parts) == 2 {
				flightDate = parts[0]
				timePart := parts[1]
				if len(timePart) >= 5 {
					flightTime = timePart[:5]
				} else {
					flightTime = timePart
				}
			}
		}

		if flightDate == "" {
			flightDate = time.Now().Format("2006-01-02")
		}
		if flightTime == "" {
			flightTime = "12:00"
		}

		flight := Flight{
			ID:      strconv.FormatInt(time.Now().UnixNano(), 10),
			Number:  strings.TrimSpace(req.Number),
			Airline: strings.TrimSpace(req.Airline),
			From:    strings.TrimSpace(req.From),
			To:      strings.TrimSpace(req.To),
			Time:    flightTime,
			Date:    flightDate,
			Status:  "scheduled",
		}

		flightsMutex.Lock()
		flights = append(flights, flight)
		flightsMutex.Unlock()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "added",
			"id":     flight.ID,
		})
	}))

	// Обновить статус
	http.HandleFunc("/api/flights/update", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var update struct {
			ID     string `json:"id"`
			Status string `json:"status"`
		}

		if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		flightsMutex.Lock()
		for i := range flights {
			if flights[i].ID == update.ID {
				flights[i].Status = update.Status
				break
			}
		}
		flightsMutex.Unlock()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
	}))

	// Удалить рейс
	http.HandleFunc("/api/flights/delete", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			ID string `json:"id"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		flightsMutex.Lock()
		newFlights := []Flight{}
		for _, f := range flights {
			if f.ID != req.ID {
				newFlights = append(newFlights, f)
			}
		}
		flights = newFlights
		flightsMutex.Unlock()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
	}))

	// Информация о сервере (для QR кода) - ОБНОВЛЕНО!
	http.HandleFunc("/api/server/info", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		
		// Проверяем, работаем ли в Docker
		isDocker := false
		if _, err := os.Stat("/.dockerenv"); err == nil {
			isDocker = true
		}
		
		response := map[string]interface{}{
			"url": "http://host.docker.internal:3000",
			"backend": "http://localhost:8080",
			"isDocker": isDocker,
			"timestamp": time.Now().Format(time.RFC3339),
			"message": "Для доступа с телефона используйте IP вашего компьютера в локальной сети",
		}
		
		json.NewEncoder(w).Encode(response)
	}))

	// Статические файлы фронтенда
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	log.Printf("🚀 Сервер запущен на %s", addr)
	
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}

// Функция для получения локальных IP адресов
func getLocalIPs() []string {
	var ips []string
	
	// Добавляем стандартные
	ips = append(ips, "localhost", "127.0.0.1")
	
	// Получаем сетевые интерфейсы
	ifaces, err := net.Interfaces()
	if err != nil {
		return ips
	}
	
	for _, iface := range ifaces {
		// Пропускаем неактивные интерфейсы
		if iface.Flags&net.FlagUp == 0 {
			continue
		}
		
		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}
		
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			
			// Пропускаем loopback и IPv6
			if ip == nil || ip.IsLoopback() || ip.To4() == nil {
				continue
			}
			
			// Добавляем IPv4 адрес
			ips = append(ips, ip.String())
		}
	}
	
	return ips
}