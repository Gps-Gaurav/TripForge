# Bus_seat_booking
# TripForge 🚌

TripForge is a bus booking backend API built using Django REST Framework. It allows users to register, log in, book seats, cancel bookings, and view booking statistics.

🔗 **Live Demo:** [https://tripforge-1.onrender.com/](https://tripforge-1.onrender.com/)

> ⚠️ **Note:** Since this backend is hosted on Render's free tier, the server may take up to **50 seconds** to wake up after inactivity. You might encounter a temporary connection error — please wait and try again.

---

## 🔧 Features

* User Registration & Login with Token Auth
* Search Buses by origin, destination, and date
* Book a seat (with validation)
* Cancel a booking (with reason)
* View current, past, and cancelled bookings
* Admin features (via Django Admin panel)

---

## 🚀 Tech Stack

* Django
* Django REST Framework
* Token Authentication
* Hosted on: Render.com (Free Tier)

---

## 📂 API Endpoints (Sample)

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| POST   | `/register/`                      | Register a new user      |
| POST   | `/login/`                         | Login and get auth token |
| GET    | `/buses/`                         | List available buses     |
| POST   | `/bookings/`                      | Create a booking         |
| GET    | `/bookings/user/<user_id>/`       | View user bookings       |
| POST   | `/bookings/<booking_id>/cancel/`  | Cancel a booking         |
| GET    | `/bookings/user/<user_id>/stats/` | View booking stats       |

---

## 🧪 Testing with Postman or cURL

Don't forget to include the token in your headers:

```
Authorization: Token <your_token>
```


## 📫 Contact

If you have any questions or suggestions, feel free to reach out!

---

**Made with ❤️ using Django & DRF**
