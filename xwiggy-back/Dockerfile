FROM maven:3.8.8-eclipse-temurin-11 AS build
WORKDIR /app
COPY xwiggy-back/pom.xml .
COPY xwiggy-back/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:11-jre
WORKDIR /app
COPY --from=build /app/target/xwiggy-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
