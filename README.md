# Agriconnect: Empowering Smallholder Farmers with Multimodal AI Knowledge

![Agriconnect Logo](/images/logo.jpeg)

## Demo
<table>
  <tr>
    <td><img src="/images/demo1.png" alt="Generate answer from retrieved content from internal database"></td>
    <td><img src="/images/demo2.png" alt="Evaluate if RAG results are relevant"></td>
  </tr>
  <tr>
    <td><img src="/images/demo3.png" alt="Answer in the same user language"></td>
    <td><img src="/images/demo4.png" alt="Crop disease recognition"></td>
  </tr>
</table>

## Background
Agriconnect is an innovative AI-powered platform designed to empower smallholder farmers by providing them with critical agricultural knowledge and resources. We aim to break down barriers to access and comprehension, enabling knowledge institutions to interact directly with farmers and communities, offering not only farming practice advice but also guidance on accessing financing, adopting technology, and expanding market access.

This repository hosts the codebase and resources for Agriconnect. The project aligns with the Sustainable Development Goals (SDGs) set by the United Nations, particularly focusing on:

- **SDG 1 - No Poverty** Building resilience of the poor and those in vulnerable situations and reducing their vulnerability to climate-related extreme events
- **SDG 2 - Zero Hunger:** Eradicating hunger and malnutrition by doubling agricultural productivity, ensuring sustainable food production systems and implementing resilient agricultural practices.
- **SDG 13 - Climate Action:** Helping farmers adapt to and mitigate the effects of climate change, promoting sustainable agriculture.
- **SDG 17 - Partnership for the Goals** - Promoting the development and transfer of environmentally sound technologies to the least developed countries, while promoting effective public, public-private and civil society partnerships 

## Features

- **Multimodal AI Knowledge:** Agriconnect provides information in a variety of formats, making it accessible to a wide audience through text, images, and voice.
- **Interactive Local Language Content:** Knowledge institutions can convert their expertise into locally relevant content, breaking down language barriers.
- **Promoting Sustainability:** Agriconnect contributes to reducing environmental strain, combating resource-intensive farming, and fostering sustainable livelihoods for smallholder farmers.

## Tech Stack

### AI models: 
- OpenAI whisper-1
- Anthropic claude-instant-1
- ElevenLabs: eleven_multilingual_v2
- OpenAI GPT4-Vision

### AI dev tools: 
- Supabase: vector database for RAG
- Humanloop: prompt management and quality evaluation

### Infrastructure
- Node.js
- TypeScript
- Langchain
- Telegram Bot API

## Getting Started

1. Download git and run npm install
2. Rename .env.example to .env and fill in the API keys
3. Go to your terminal and run npx nodemon index.ts
