package com.minion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MinionApplication {

    public static void main(String[] args) {
        SpringApplication.run(MinionApplication.class, args);
        System.out.println("""
                 __  __ _                        _          \s
                |  \\/  (_) ___ _ __ ___  ___ ___| |_ _   _  \s
                | |\\/| | |/ __| '__/ _ \\/ __/ __| __| | | |\s
                | |  | | | (__| | | (_) \\__ \\__ \\ |_| |_| |\s
                |_|  |_|_|\\___|_|  \\___/|___/___/\\__|\\__, |\s
                                                     |___/ \s
                Minion Server 启动成功! Bello! 🍌  http://localhost:8080
                """);
    }
}
