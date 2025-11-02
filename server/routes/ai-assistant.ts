import { Request, Response } from 'express';
import { perplexityAIService } from '../services/perplexity-ai-service';
import { chatStorage } from '../services/chat-storage';
import { ChatMessage } from '../types/ai-types';

/**
 * POST /api/ai/chat
 * Send a message and get AI response
 */
export async function handleChat(req: Request, res: Response) {
  try {
    const { message, chatId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create chat session
    let chat = chatId ? await chatStorage.getChat(chatId) : null;
    if (!chat) {
      chat = await chatStorage.createChat();
    }

    // Get chat history BEFORE adding new user message
    const chatHistory = chat.messages || [];
    
    // Process message with Perplexity AI
    const aiResponse = await perplexityAIService.generateResponse(message, chatHistory);
    
    // Create user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    // Add user message to chat
    await chatStorage.addMessage(chat.id, userMessage);

    // Create AI message
    const aiMessage: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      type: 'ai',
      content: aiResponse.content,
      timestamp: new Date(),
      sources: aiResponse.sources,
    };

    // Add AI message to chat
    await chatStorage.addMessage(chat.id, aiMessage);

    // Return response
    res.json({
      chatId: chat.id,
      message: aiMessage,
    });
  } catch (error) {
    console.error('Error handling chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/ai/new-chat
 * Create a new chat session
 */
export async function handleNewChat(req: Request, res: Response) {
  try {
    const chat = await chatStorage.createChat();
    res.json({ chatId: chat.id });
  } catch (error) {
    console.error('Error creating new chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/ai/history/:chatId
 * Get chat history
 */
export async function handleGetHistory(req: Request, res: Response) {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    const chat = await chatStorage.getChat(chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/ai/chats
 * Get all chat sessions
 */
export async function handleGetAllChats(req: Request, res: Response) {
  try {
    const chats = await chatStorage.getAllChats();
    res.json({ chats });
  } catch (error) {
    console.error('Error getting all chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * DELETE /api/ai/chat/:chatId
 * Delete a chat session
 */
export async function handleDeleteChat(req: Request, res: Response) {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    const success = await chatStorage.deleteChat(chatId);

    if (!success) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
