# EchoCart - Full Stack E-Commerce Application

![Java](https://img.shields.io/badge/Java-21-orange?style=flat&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen?style=flat&logo=spring)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat&logo=mysql)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat&logo=javascript)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-purple?style=flat&logo=bootstrap)
![Maven](https://img.shields.io/badge/Maven-3.6+-red?style=flat&logo=apache-maven)

EchoCart is a modern, full-stack e-commerce web application built with Spring Boot backend and vanilla JavaScript frontend. It provides a complete shopping experience with user authentication, product management, shopping cart, and order processing.

## 🚀 Tech Stack

### Backend
- **Java 21** - Programming language
- **Spring Boot 3.3.3** - Application framework
- **Spring Data JPA** - Data persistence
- **Spring Security (BCrypt)** - Password encryption
- **MySQL 8** - Database
- **Maven** - Build tool
- **Hibernate** - ORM framework

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with custom properties
- **Vanilla JavaScript (ES6+)** - Client-side logic
- **Bootstrap 5.3.3** - UI framework
- **Bootstrap Icons** - Icon library
- **Fetch API** - HTTP requests

### Development & Deployment
- **Maven** - Dependency management
- **Vercel** - Frontend deployment (configured)
- **CORS** - Cross-origin resource sharing enabled

## 📁 Project Structure

```
E-Commerce/
├── src/main/
│   ├── java/com/echocart/backend/
│   │   ├── controller/          # REST API controllers
│   │   │   ├── UserController.java
│   │   │   ├── ProductController.java
│   │   │   ├── CartController.java
│   │   │   ├── OrderController.java
│   │   │   └── PaymentController.java
│   │   ├── entity/              # JPA entities
│   │   │   ├── User.java
│   │   │   ├── Product.java
│   │   │   ├── Cart.java
│   │   │   ├── Order.java
│   │   │   └── Payment.java
│   │   ├── repository/          # Data access layer
│   │   ├── service/             # Business logic layer
│   │   └── EchoCart.java        # Main application class
│   └── resources/
│       ├── static/              # Frontend files
│       │   ├── index.html       # Landing page
│       │   ├── admin.html       # Admin dashboard
│       │   ├── customer.html    # Customer dashboard
│       │   ├── order-summary.html
│       │   ├── css/style.css    # Custom styles
│       │   ├── js/              # JavaScript modules
│       │   │   ├── main.js      # Authentication & utilities
│       │   │   ├── cart.js      # Shopping cart logic
│       │   │   ├── product.js   # Product management
│       │   │   ├── admin.js     # Admin functionality
│       │   │   └── customer.js  # Customer dashboard
│       │   └── assets/          # Images and icons
│       └── application.properties # Spring configuration
├── pom.xml                      # Maven dependencies
├── vercel.json                  # Deployment configuration
└── README.md
```

## 🔧 Prerequisites

- **Java 21** or higher
- **Maven 3.6+**
- **MySQL 8.0+**
- **Modern web browser**
- **IDE** (IntelliJ IDEA, Eclipse, or VS Code)

## ⚙️ Setup & Installation

### 1. Database Setup
```sql
-- Create database
CREATE DATABASE echocart;

-- Create user (optional)
CREATE USER 'echocart_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON echocart.* TO 'echocart_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Configuration
1. Clone the repository
2. Navigate to the project directory
3. Update `src/main/resources/application.properties`:
```properties
# Server Configuration
server.port=8081

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/echocart?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

### 3. Run the Application

#### Using Maven:
```bash
# Install dependencies and run
mvn clean install
mvn spring-boot:run
```

#### Using IDE:
1. Import the project as a Maven project
2. Run the `EchoCart.java` main class

#### Using JAR:
```bash
# Build JAR
mvn clean package

# Run JAR
java -jar target/EchoCart-1.0-SNAPSHOT.jar
```

### 4. Access the Application
- **Frontend**: http://localhost:8081 (served by Spring Boot)
- **API Base URL**: http://localhost:8081/api
- **Admin Dashboard**: http://localhost:8081/admin.html
- **Customer Dashboard**: http://localhost:8081/customer.html

## 👥 User Accounts

### Customer Registration
- Navigate to the homepage
- Click "Login" → "Register here"
- Select "Customer Account" tab
- Fill in the required details

### Admin Registration
- Select "Admin Account" tab during registration
- Use admin security key: `ADMIN`
- Admin accounts have full system access

## 🛠️ API Endpoints

### Authentication
- `POST /api/users/register/customer` - Register customer
- `POST /api/users/register/admin` - Register admin
- `POST /api/users/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/{id}` - Update product (Admin)
- `DELETE /api/products/{id}` - Delete product (Admin)

### Cart & Orders
- `GET /api/cart/{userId}` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/orders` - Create order
- `GET /api/orders/user/{userId}` - Get user orders

## 🎨 Features

### Customer Features
- User registration and authentication
- Browse products by categories
- Search functionality
- Shopping cart management
- Order placement and tracking
- User profile management
- Responsive design

### Admin Features
- Admin dashboard with analytics
- Product management (CRUD operations)
- User management
- Order management and status updates
- Role-based access control

### Technical Features
- RESTful API architecture
- JWT-like session management
- Password encryption with BCrypt
- Input validation
- Error handling
- CORS configuration
- Responsive UI with Bootstrap
- Modern JavaScript (ES6+)

## 🔒 Security

- Password encryption using BCrypt
- Role-based access control (Customer/Admin)
- Admin security key protection
- Input validation on both frontend and backend
- CORS configuration for secure cross-origin requests

## 🚀 Deployment

### Frontend (Vercel)
The project includes `vercel.json` for easy frontend deployment:
```bash
# Deploy to Vercel
npx vercel --prod
```

### Backend
Deploy the Spring Boot application to:
- **Heroku**: Use the included `pom.xml`
- **AWS**: Deploy as JAR or Docker container
- **Railway**: Direct Maven deployment

## 🧪 Testing

Run tests using Maven:
```bash
mvn test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `application.properties`
   - Verify database exists

2. **Port Already in Use**
   - Change port in `application.properties`: `server.port=8082`
   - Kill process using port 8081: `lsof -ti:8081 | xargs kill -9`

3. **CORS Issues**
   - Backend includes CORS configuration for localhost:5500 and file://
   - Update CORS origins in `EchoCart.java` if needed

4. **Frontend Not Loading**
   - Ensure backend is running on port 8081
   - Check browser console for JavaScript errors
   - Verify API endpoints are accessible

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**EchoCart** - Your trusted partner for premium products and exceptional shopping experience! 🛒✨
