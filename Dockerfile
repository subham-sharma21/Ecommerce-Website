FROM eclipse-temurin:21-jdk

WORKDIR /app

# copy everything
COPY . .

# mvnw root me hai
RUN chmod +x mvnw

# E-Commerce ke pom.xml se build karo
RUN ./mvnw -f E-Commerce/pom.xml clean package -DskipTests

EXPOSE 8081

CMD ["java", "-jar", "E-Commerce/target/echocart-0.0.1-SNAPSHOT.jar"]
