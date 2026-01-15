FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

WORKDIR /app/E-Commerce

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests && ls -l target

EXPOSE 8081

CMD ["java", "-jar", "target/echocart-0.0.1-SNAPSHOT.jar"]
