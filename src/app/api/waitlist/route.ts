import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// 建议将 API Key 放在 .env.local 文件中
// RESEND_API_KEY=re_123456789
const apiKey = process.env.RESEND_API_KEY;
const isDevOrMissingKey = !apiKey || apiKey.includes('your_actual_key');
const resend = new Resend(apiKey || 're_123'); // Prevent instantiation error

export async function POST(request: Request) {
  try {
    const { email, category, query } = await request.json();

    // --- 本地测试模式 (Simulation Mode) ---
    if (isDevOrMissingKey) {
      console.log("\n====== [MOCK EMAIL SENT] ======");
      console.log(`To: x253400489@gmail.com`);
      console.log(`Subject: New Waitlist Signup: ${category}`);
      console.log(`Data: Email=${email}, Query=${query}`);
      console.log("===============================\n");
      
      // 模拟网络延迟，让Loading圈转一会儿
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({ ok: true, data: { id: 'mock_id' } });
    }
    // ------------------------------------

    // 发送邮件给你自己
    const { data, error } = await resend.emails.send({
      from: 'TipOfMy Waitlist <onboarding@resend.dev>', // 认证域名后可以改
      to: ['x253400489@gmail.com'], // 填入你的接收邮箱
      subject: `New Waitlist Signup: ${category}`,
      html: `
        <h1>New Signup for ${category}</h1>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>User Description:</strong> ${query || 'None'}</p>
        <hr />
        <p>This message was sent from TipOfMy.com Portal.</p>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
