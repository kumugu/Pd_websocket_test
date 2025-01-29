package com.example.demo.handler;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {
    private static final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("새로운 클라이언트 접속: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // JSON 메시지 파싱
        JsonNode jsonNode = objectMapper.readTree(message.getPayload());
        String messageText = jsonNode.get("message").asText();
        String time = jsonNode.get("time").asText();

        // 다른 클라이언트들에게 메시지 전달
        for (WebSocketSession connectedSession : sessions) {
            if (!session.getId().equals(connectedSession.getId())) {
                String formattedMessage = String.format("[%s] %s: %s",
                        time,
                        session.getId().substring(0, 8), // ID 앞 8자리만 사용
                        messageText
                );
                connectedSession.sendMessage(new TextMessage(formattedMessage));
            }
        }
    }
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        System.out.println("클라이언트 접속 해제: " + session.getId());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.out.println("전송 에러 발생: " + session.getId() + ", 에러: " + exception.getMessage());
    }

    private static class ChatMessage {
        private String sender;
        private String message;
        private String time;

        public ChatMessage(String sender, String message, String time) {
            this.sender = sender;
            this.message = message;
            this.time = time;
        }

        public String getSender() {
            return sender;
        }

        public String getMessage() {
            return message;
        }

        public String getTime() {
            return time;
        }
    }
}