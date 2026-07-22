import { ChatSession } from '../types';

export function exportChatAsMarkdown(session: ChatSession): void {
  const dateStr = new Date(session.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let md = `# ${session.title || 'Ariella AI Chat'}\n\n`;
  md += `**Date:** ${dateStr}\n`;
  md += `**Engine:** ${session.engine ? session.engine.toUpperCase() : 'STANDARD'}\n`;
  md += `**Web Search Grounded:** ${session.searchEnabled ? 'Yes' : 'No'}\n`;
  md += `**Created By:** Ariella Agnes\n\n`;
  md += `---\n\n`;

  if (!session.messages || session.messages.length === 0) {
    md += `*No messages in this session.*\n`;
  } else {
    session.messages.forEach((msg, idx) => {
      const isUser = msg.role === 'user';
      const roleName = isUser ? '👤 User' : '🧠 Ariella AI';
      const timestampStr = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';

      md += `### ${roleName}\n`;
      if (timestampStr) {
        md += `*${timestampStr}*\n\n`;
      }

      if (msg.thinkingSteps && msg.thinkingSteps.length > 0) {
        md += `<details>\n<summary>💭 <strong>Thinking & Reasoning Steps</strong></summary>\n\n`;
        msg.thinkingSteps.forEach(step => {
          md += `> ${step}\n`;
        });
        md += `\n</details>\n\n`;
      }

      if (msg.attachments && msg.attachments.length > 0) {
        md += `**Attachments:**\n`;
        msg.attachments.forEach(att => {
          md += `- 📎 \`${att.name}\` (${att.mimeType || 'file'})\n`;
        });
        md += `\n`;
      }

      md += `${msg.content}\n\n`;

      if (msg.sources && msg.sources.length > 0) {
        md += `**Sources & Grounding Links:**\n`;
        msg.sources.forEach(src => {
          md += `- [${src.title || src.uri}](${src.uri})\n`;
        });
        md += `\n`;
      }

      if (idx < session.messages.length - 1) {
        md += `---\n\n`;
      }
    });
  }

  md += `\n\n---\n*Exported from Ariella AI • Created by Ariella Agnes*\n`;

  const safeFilename = (session.title || 'chat')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
  const filename = `ariella_chat_${safeFilename}_${new Date().toISOString().slice(0, 10)}.md`;

  downloadFile(md, filename, 'text/markdown;charset=utf-8;');
}

export function exportChatAsJson(session: ChatSession): void {
  const exportData = {
    exportVersion: '1.0',
    app: 'Ariella AI',
    createdBy: 'Ariella Agnes',
    exportedAt: new Date().toISOString(),
    session: {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      engine: session.engine,
      searchEnabled: session.searchEnabled,
      messages: (session.messages || []).map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        thinkingSteps: m.thinkingSteps || [],
        sources: m.sources || [],
        searchQueries: m.searchQueries || [],
        attachments: m.attachments ? m.attachments.map(att => ({
          name: att.name,
          mimeType: att.mimeType,
          previewUrl: att.previewUrl || ''
        })) : []
      }))
    }
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const safeFilename = (session.title || 'chat')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
  const filename = `ariella_chat_${safeFilename}_${new Date().toISOString().slice(0, 10)}.json`;

  downloadFile(jsonString, filename, 'application/json;charset=utf-8;');
}

function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
