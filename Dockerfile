# Stage 1 — Build Angular
FROM node:16-alpine AS angular-build
WORKDIR /workspace/xwiggy-app
COPY xwiggy-app/package*.json ./
RUN npm install --legacy-peer-deps
COPY xwiggy-app/ ./
RUN npm run build -- --prod

# Stage 2 — Build Spring Boot JAR (bundles Angular static files)
FROM maven:3.8.8-eclipse-temurin-11 AS build
WORKDIR /workspace
COPY xwiggy-back/pom.xml ./xwiggy-back/pom.xml
COPY xwiggy-back/src      ./xwiggy-back/src
# Place Angular dist where pom.xml expects it: ../xwiggy-app/dist/xwiggy-app
COPY --from=angular-build /workspace/xwiggy-app/dist ./xwiggy-app/dist
WORKDIR /workspace/xwiggy-back
RUN mvn clean package -DskipTests

# Stage 3 — Minimal runtime image
FROM eclipse-temurin:11-jre
WORKDIR /app
COPY --from=build /workspace/xwiggy-back/target/xwiggy-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
