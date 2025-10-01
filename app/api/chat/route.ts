import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // 检查是否配置了OpenAI API Key
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      // 演示模式：返回模拟的AI响应
      const demoResponses = [
        "I can help you create engaging lesson plans! What topic or skill would you like to focus on?",
        "That's a great question about teaching methodology. Here are some evidence-based strategies you can try:\n\n1. Use scaffolding to gradually release responsibility\n2. Incorporate multimodal learning approaches\n3. Provide immediate feedback and error correction\n4. Create authentic communication opportunities",
        "For grammar instruction, I recommend the PPP approach (Presentation, Practice, Production). Start with context and examples, then move to controlled practice, and finally free production activities.",
        "Assessment should be both formative and summative. Consider using:\n\n• Quick comprehension checks during lessons\n• Peer assessment activities\n• Self-reflection journals\n• Portfolio-based evaluation\n• Performance-based tasks",
        "Classroom management becomes easier with:\n\n• Clear expectations and routines\n• Positive reinforcement systems\n• Engaging, student-centered activities\n• Consistent and fair consequences\n• Building rapport with students",
        "To differentiate instruction for diverse learners:\n\n• Offer multiple ways to access content\n• Provide various ways to demonstrate learning\n• Adjust complexity and pacing\n• Use flexible grouping strategies\n• Incorporate students' cultural backgrounds",
        "Technology can enhance language learning through:\n\n• Interactive digital content\n• Online collaboration tools\n• Language learning apps\n• Virtual reality experiences\n• AI-powered feedback systems",
        "To motivate students, try:\n\n• Setting achievable goals\n• Celebrating progress and effort\n• Connecting lessons to real-world applications\n• Encouraging student choice and autonomy\n• Creating a supportive learning environment"
      ]

      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)]

      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      return NextResponse.json({
        message: randomResponse,
        model: 'demo-mode',
        usage: { total_tokens: 0 }
      })
    }

    // 真实OpenAI API调用
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert English language teaching assistant. You help teachers with:
            - Lesson planning and curriculum design
            - Teaching methodology and strategies
            - Student assessment and evaluation
            - Classroom management techniques
            - Educational technology integration
            - Differentiated instruction approaches

            Always provide practical, actionable advice based on current educational research and best practices. Keep responses concise but comprehensive, and include specific examples when helpful.`
          },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from AI model')
    }

    return NextResponse.json({
      message: assistantMessage,
      model: data.model,
      usage: data.usage
    })

  } catch (error) {
    console.error('Chat API error:', error)

    // 出错时返回友好的错误消息
    return NextResponse.json({
      message: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or check if your OpenAI API key is properly configured.",
      error: true
    }, { status: 500 })
  }
}