import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { thread_content, video_vibe } = await req.json()
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    if (!thread_content) {
      throw new Error('Thread content is required')
    }

    const systemPrompt = `You are an expert viral script writer for TikTok and Instagram Reels. 
    Your goal is to take a social media thread (Reddit, Twitter/X) and convert it into a compelling video script.
    
    The user wants a "${video_vibe || 'cinematic'}" vibe.
    
    Output NOTHING but a raw JSON object with this structure:
    {
      "scenes": [
        {
          "id": 1,
          "dialogue": "Spoken words...",
          "visualInstruction": "Visual description...",
          "duration": "3s"
        }
      ]
    }
    
    Keep it under 60 seconds total. Make it engaging, fast-paced, and optimized for retention.`

    const userPrompt = `Here is the thread content:\n\n${thread_content}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    const generatedContent = JSON.parse(data.choices[0].message.content)

    return new Response(
      JSON.stringify(generatedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error generating script:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
