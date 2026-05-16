import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log("=================================");
  console.log("  SIMULADOR DE PRESUPUESTO PERSONAL");
  console.log("=================================\n");

  const conversationHistory = [];

  // System prompt para el asistente financiero
  const systemPrompt = `Eres un asesor financiero experto en presupuestos personales. 
Tu rol es ayudar al usuario a crear, analizar y optimizar su presupuesto mensual.

Puedes:
1. Ayudar a crear categorías de gastos (vivienda, alimentos, transporte, entretenimiento, etc.)
2. Registrar ingresos y gastos
3. Calcular balances y porcentajes
4. Dar recomendaciones para ahorrar
5. Analizar tendencias de gastos
6. Sugerir ajustes al presupuesto

Siempre proporciona números claros y consejos prácticos.
Cuando el usuario proporcione información financiera, resúmela y analízala de forma útil.
Sé empático pero directo con las recomendaciones.`;

  console.log(
    "Bienvenido al Simulador de Presupuesto Personal. Voy a ayudarte a gestionar tus finanzas."
  );
  console.log(
    "Escribe 'salir' cuando quieras terminar la conversación.\n"
  );

  // Mensaje inicial del asistente
  const initialMessage = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content:
          "Hola, quiero empezar a gestionar mi presupuesto mensual. ¿Por dónde empezamos?",
      },
    ],
  });

  const assistantGreeting =
    initialMessage.content[0].type === "text"
      ? initialMessage.content[0].text
      : "";
  console.log(`Asistente: ${assistantGreeting}\n`);

  conversationHistory.push({
    role: "user",
    content:
      "Hola, quiero empezar a gestionar mi presupuesto mensual. ¿Por dónde empezamos?",
  });
  conversationHistory.push({
    role: "assistant",
    content: assistantGreeting,
  });

  // Loop principal de conversación
  while (true) {
    const userInput = await question("Tú: ");

    if (userInput.toLowerCase() === "salir") {
      console.log(
        "\nAsistente: ¡Gracias por usar el Simulador de Presupuesto! Recuerda revisar regularmente tu presupuesto y ajustarlo según sea necesario. ¡Hasta luego!"
      );
      break;
    }

    if (!userInput.trim()) {
      continue;
    }

    conversationHistory.push({
      role: "user",
      content: userInput,
    });

    try {
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: conversationHistory,
      });

      const assistantMessage =
        response.content[0].type === "text" ? response.content[0].text : "";

      conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });

      console.log(`\nAsistente: ${assistantMessage}\n`);
    } catch (error) {
      console.error("Error al procesar tu solicitud:", error.message);
      // Remover el último mensaje del usuario si hubo error
      conversationHistory.pop();
    }
  }

  rl.close();
}

main().catch(console.error);