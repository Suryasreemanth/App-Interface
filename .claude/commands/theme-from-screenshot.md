# Theme from Screenshot

Look at the screenshot image I've attached. Analyze the UI design — colors, backgrounds, gradients, typography style, and overall visual tone.

Then update the background and theme of this Next.js project (`uigen`) to match that aesthetic. Specifically:

1. **Global background**: Update `src/app/globals.css` or Tailwind config to reflect the background color/gradient from the screenshot.
2. **Main layout**: Update `src/app/main-content.tsx` — background colors of the left chat panel and right preview panel to match.
3. **Chat header and input area**: Adjust background and border colors in `src/components/chat/ChatInterface.tsx` and `src/components/chat/MessageInput.tsx` to fit the theme.
4. **Message bubbles**: Adjust user and assistant bubble colors in `src/components/chat/MessageList.tsx` to complement the new theme.
5. **Top bar (Preview/Code tabs)**: Update colors in `main-content.tsx` to match.

Keep the layout and functionality exactly the same — only change visual styling (colors, backgrounds, borders, shadows). Use Tailwind utility classes wherever possible. If a color isn't available as a Tailwind class, use inline style or add a CSS variable in `globals.css`.

After making all changes, summarize what colors/styles you applied and which files were modified.
