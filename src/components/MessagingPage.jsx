import { useEffect, useState } from 'react';
import { Mail, MailOpen } from 'lucide-react';
import './MessagingPage.css';

function MessagingPage({
  messages,
  selectedMessageId,
  onSelectMessage,
  onAddMessage,
  onSendMessage,
  composeDraft,
  onComposeDraftUsed,
}) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [isComposing, setIsComposing] = useState(false);
  const [composeMessage, setComposeMessage] = useState({ to: 'Zakariah', subject: 'Mohammed · ', text: '' });
  const [messageText, setMessageText] = useState('');
  const selectedMessage = messages.find((item) => item.id === selectedMessageId);

  useEffect(() => {
    if (!composeDraft) return;

    setComposeMessage({
      to: composeDraft.to || 'Zakariah',
      subject: composeDraft.subject || 'Mohammed · ',
      text: composeDraft.text || '',
    });
    setIsComposing(true);
    onComposeDraftUsed();
  }, [composeDraft, onComposeDraftUsed]);

  function getFilteredMessages() {
    const query = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesTab =
        tab === 'All' ||
        (tab === 'Unread' && message.unread > 0) ||
        message.child === tab;
      const matchesSearch =
        !query ||
        [message.sender, message.subject, message.preview].some((field) => field.toLowerCase().includes(query));

      return matchesTab && matchesSearch;
    });
  }

  const filteredMessages = getFilteredMessages();

  function handleComposeSubmit(event) {
    event.preventDefault();
    if (!composeMessage.subject.trim() || !composeMessage.text.trim()) return;

    onAddMessage({
      to: composeMessage.to.trim(),
      subject: composeMessage.subject.trim(),
      text: composeMessage.text.trim(),
    });
    setComposeMessage({ to: 'Zakariah', subject: 'Mohammed · ', text: '' });
    setIsComposing(false);
  }

  function handleMessageSubmit(event) {
    event.preventDefault();
    if (!messageText.trim() || !selectedMessage) return;

    onSendMessage(selectedMessage.id, messageText.trim());
    setMessageText('');
  }

  return (
    <div className="page messages-page">
      <div className="page-header small-header">
        <div>
          <p className="section-label">Inbox</p>
          <h1>Messages</h1>
          <p className="subheader">Conversations with your child’s teachers and the school office.</p>
        </div>
        <button className="button-primary" onClick={() => setIsComposing((current) => !current)}>
          {isComposing ? 'Close composer' : '+ New message'}
        </button>
      </div>
      {isComposing && (
        <form className="compose-panel panel" onSubmit={handleComposeSubmit}>
          <div className="form-row">
            <label>
              To
              <select
                value={composeMessage.to}
                onChange={(event) => setComposeMessage({ ...composeMessage, to: event.target.value })}
              >
                <option>Zakariah</option>
                <option>Abdul Rahman</option>
              </select>
            </label>
            <label>
              Subject
              <input
                value={composeMessage.subject}
                onChange={(event) => setComposeMessage({ ...composeMessage, subject: event.target.value })}
              />
            </label>
          </div>
          <label>
            Message
            <textarea
              rows="4"
              value={composeMessage.text}
              onChange={(event) => setComposeMessage({ ...composeMessage, text: event.target.value })}
              placeholder="Write a message..."
            />
          </label>
          <button className="button-primary" type="submit">Send message</button>
        </form>
      )}
      <div className="messages-layout">
        <div className="message-list panel">
          <div className="message-search">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages..."
              aria-label="Search messages"
            />
          </div>
          <div className="message-tabs">
            {['All', 'Mohammed', 'Unread'].map((item) => (
              <button
                key={item}
                className={tab === item ? 'tab active' : 'tab'}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>
          {filteredMessages.map((message) => (
            <button
              key={message.id}
              className={message.id === selectedMessageId ? 'message-item active' : 'message-item'}
              onClick={() => onSelectMessage(message.id)}
            >
              <div>
                <p className="message-sender">{message.sender}</p>
                <p className="message-subject">{message.subject}</p>
                <p className="message-preview">{message.preview}</p>
              </div>
              <div className="message-meta">
                {message.unread > 0 ? (
                  <Mail className="message-state-icon" size={18} aria-label="Unread message" />
                ) : (
                  <MailOpen className="message-state-icon" size={18} aria-label="Read message" />
                )}
                {message.unread > 0 && <span className="unread-badge">{message.unread} new</span>}
                <span className="message-time">{message.time}</span>
              </div>
            </button>
          ))}
          {filteredMessages.length === 0 && <p className="empty-state">No messages match this filter.</p>}
        </div>
        {selectedMessage ? (
          <div className="conversation panel">
            <div className="conversation-header">
              <div>
                <p className="message-sender">{selectedMessage.sender}</p>
                <p className="message-subject small-heading">{selectedMessage.subject}</p>
              </div>
            </div>
            <div className="conversation-messages">
              {selectedMessage.conversation?.map((item, index) => (
                <div key={`${item.time}-${index}`} className={item.who === 'uk' ? 'bubble left' : 'bubble right'}>
                  <p>{item.text}</p>
                  <span>{item.time}</span>
                </div>
              ))}
            </div>
            <form className="send-box" onSubmit={handleMessageSubmit}>
              <textarea
                rows="3"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Type a message..."
              />
              <button className="button-primary" type="submit">Send message</button>
            </form>
          </div>
        ) : (
          <div className="conversation panel empty-state">Choose a conversation.</div>
        )}
      </div>
    </div>
  );
}

export default MessagingPage;
