Here is your revised README:

---
# GPTweet - ChatGPT UI 

GPTweet - ChatGPT UI is a unique chatbot interface with social plugins tailored specifically for OpenAI's chat models. This project is built upon [Chatbot UI Lite](https://github.com/mckaywrigley/chatbot-ui-lite), utilizing Next.js, TypeScript, and Tailwind CSS. It integrates a Twitter plugin, GPTweet, which lets ChatGPT interact with your Twitter account for a personalized AI social media experience.

See a [demo](https://twitter.com/mckaywrigley/status/1640380021423603713?s=46&t=AowqkodyK6B4JccSOxSPew).

![GPTweet - ChatGPT UI](./public/screenshots/screenshot-0402023.jpg)

## GPTweet Features

With GPTweet, you can:

- Compose and post a new tweet with ChatGPT's assistance
- Reply to a tweet in a specific thread
- Get notified of mentions and replies you care about
- View a user's profile information

In addition to enhancing your Twitter management with AI capabilities, GPTweet helps you boost your social media presence with more engaging content.

## Updates

The GPTweet - ChatGPT UI will continue to be updated over time, with new features and improvements added regularly.

**Next up:**


**Recent updates:**

- [x] Twitter integration (4/20/23)
- [x] Prompt templates (3/27/23)
- [x] Regenerate & edit responses (3/25/23)

## Modifications

You can customize the chat interface in `components/Chat`.

To modify the sidebar interface, refer to `components/Sidebar`.

System prompts can be adjusted in `utils/index.ts`.


**Docker**

Build locally:

```shell
docker build -t gptweet-frontend .
docker run -e OPENAI_API_KEY=xxxxxxxx -p 3000:3000 gptweet-frontend
```
