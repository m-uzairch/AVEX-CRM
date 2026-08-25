import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { chatRequestSchema, ChatMessage } from '@/features/ai/schemas/ai-assistant-schemas';
import { AIAssistantService } from '@/features/ai/services/ai-assistant-service';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const body = await request.json();
    const validated = chatRequestSchema.parse(body);

    const answerResult = await AIAssistantService.ask(
      validated.message,
      auth.companyId,
      validated.history
    );

    const assistantMessage: ChatMessage = {
      id: `msg_ai_${Date.now()}`,
      role: 'assistant',
      content: answerResult.content,
      timestamp: new Date().toISOString(),
      suggestedFollowUps: answerResult.suggestedFollowUps,
      references: answerResult.references,
    };

    return NextResponse.json({
      message: assistantMessage,
      intent: answerResult.intent,
      suggestedFollowUps: answerResult.suggestedFollowUps,
      references: answerResult.references,
    });
  } catch (error: any) {
    console.error('[API POST /api/ai/assistant/chat] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process assistant query.' },
      { status: 400 }
    );
  }
}
