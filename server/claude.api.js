import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import config from './config.js';
import fs from 'fs-extra';

const claudeApi = express.Router();

// Load system prompt at startup
const systemPrompt = fs.readFileSync('server/claude-system-prompt.txt', 'utf8');

claudeApi.post('/api/claude', async (req, res) => {
	const apiKey = config.get('anthropic_api_key');
	if(!apiKey) {
		return res.status(500).json({
			error: 'Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable or add to config.'
		});
	}

	const { prompt, brewText } = req.body;

	if(!prompt || !prompt.trim()) {
		return res.status(400).json({ error: 'Prompt is required' });
	}

	const client = new Anthropic({ apiKey });

	try {
		const message = await client.messages.create({
			model  : 'claude-sonnet-4-20250514',
			max_tokens : 4096,
			system : systemPrompt,
			messages : [{
				role    : 'user',
				content : brewText
					? `Current document:\n\n${brewText}\n\n---\n\nUser request: ${prompt}`
					: prompt
			}]
		});

		res.json({ response: message.content[0].text });
	} catch (error) {
		console.error('Claude API error:', error);
		res.status(500).json({
			error: error.message || 'Failed to get response from Claude'
		});
	}
});

export default claudeApi;
