FROM openjdk:11

# Gradle 빌드된 JAR 파일 경로
ARG JAR_FILE=build/libs/*.jar

# JAR 파일 복사
COPY ${JAR_FILE} app.jar

# application.yml 복사
COPY ./src/main/resources/application.yml /app/resources/application.yml

# 실행 명령어
ENTRYPOINT ["java", "-jar", "/app.jar"]