import {IconArrowDown, IconClearAll, IconSettings} from '@tabler/icons-react';
import {memo, MutableRefObject, useCallback, useContext, useEffect, useRef, useState,} from 'react';
import toast from 'react-hot-toast';

import {useTranslation} from 'next-i18next';
import {saveConversation, saveConversations, updateConversation,} from '@/utils/app/conversation';
import {throttle} from '@/utils/data/throttle';

import {ChatBody, Conversation, Message} from '@/types/chat';
import {Plugin} from '@/types/plugin';
import useApiService from '@/services/useApiService';
import HomeContext from '@/pages/api/home/home.context';
import {ChatInput} from './ChatInput';
import {ChatLoader} from './ChatLoader';
import {ChatMessage} from './ChatMessage';

interface Props {
    stopConversationRef: MutableRefObject<boolean>;
    accessToken: string | null;
}


export const Chat = memo(({stopConversationRef, accessToken}: Props) => {
    const {t} = useTranslation('chat');

    const {
        state: {
            selectedConversation,
            conversations,
            // models,
            // apiKey,
            // pluginKeys,
            serverSideApiKeyIsSet,
            messageIsStreaming,
            // modelError,
            loading,
            prompts,
        },
        handleUpdateConversation,
        dispatch: homeDispatch,
    } = useContext(HomeContext);

    const [currentMessage, setCurrentMessage] = useState<Message>();
    const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showScrollDownButton, setShowScrollDownButton] =
        useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const {sendChatRequest} = useApiService(accessToken);
    const handleSend = useCallback(
        async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
            if (selectedConversation) {
                let updatedConversation: Conversation;
                if (deleteCount) {
                    const updatedMessages = [...selectedConversation.messages];
                    for (let i = 0; i < deleteCount; i++) {
                        updatedMessages.pop();
                    }
                    updatedConversation = {
                        ...selectedConversation,
                        messages: [...updatedMessages, message],
                    };
                } else {
                    updatedConversation = {
                        ...selectedConversation,
                        messages: [...selectedConversation.messages, message],
                    };
                }
                homeDispatch({
                    field: 'selectedConversation',
                    value: updatedConversation,
                });
                homeDispatch({field: 'loading', value: true});
                // implement server side streaming
                homeDispatch({field: 'messageIsStreaming', value: false});
                const chatBody: ChatBody = {
                    model: updatedConversation.model,
                    messages: updatedConversation.messages,
                    key: '',
                    prompt: updatedConversation.prompt,
                };
                // const endpoint = getEndpoint(plugin);
                // Process the response and update the UI
                // You can use the response as needed to update the conversation, messages, etc.
                // if (!plugin) {
                //   try {
                //
                //   } catch (error) {
                //     console.error('Error sending chat request:', error);
                //   }
                // } else {

                // }
                const controller = new AbortController();
                const response = await sendChatRequest(chatBody, controller.signal);
                // const response = await fetch(endpoint, {
                //   method: 'POST',
                //   headers: {
                //     'Content-Type': 'application/json',
                //   },
                //   signal: controller.signal,
                //   body,
                // });
                if (!response.ok) {
                    homeDispatch({field: 'loading', value: false});
                    homeDispatch({field: 'messageIsStreaming', value: false});
                    toast.error(response.statusText);
                    return;
                }
                const data = response.body;
                if (!data) {
                    homeDispatch({field: 'loading', value: false});
                    homeDispatch({field: 'messageIsStreaming', value: false});
                    return;
                }
                if (!plugin) {
                    if (updatedConversation.messages.length === 1) {
                        const {content} = message;
                        const customName =
                            content.length > 30 ? content.substring(0, 30) + '...' : content;
                        updatedConversation = {
                            ...updatedConversation,
                            name: customName,
                        };
                    }
                    homeDispatch({field: 'loading', value: false});
                    const reader = data.getReader();
                    const decoder = new TextDecoder();
                    let done = false;
                    let isFirst = true;
                    let text = '';
                    while (!done) {
                        if (stopConversationRef.current) {
                            controller.abort();
                            done = true;
                            break;
                        }
                        const {value, done: doneReading} = await reader.read();
                        done = doneReading;
                        const chunkValue = decoder.decode(value);
                        text += chunkValue;
                        if (isFirst) {
                            isFirst = false;
                            const updatedMessages: Message[] = [
                                ...updatedConversation.messages,
                                {role: 'assistant', content: chunkValue},
                            ];
                            updatedConversation = {
                                ...updatedConversation,
                                messages: updatedMessages,
                            };
                            homeDispatch({
                                field: 'selectedConversation',
                                value: updatedConversation,
                            });
                        } else {
                            const updatedMessages: Message[] =
                                updatedConversation.messages.map((message, index) => {
                                    if (index === updatedConversation.messages.length - 1) {
                                        return {
                                            ...message,
                                            content: text,
                                        };
                                    }
                                    return message;
                                });
                            updatedConversation = {
                                ...updatedConversation,
                                messages: updatedMessages,
                            };
                            homeDispatch({
                                field: 'selectedConversation',
                                value: updatedConversation,
                            });
                        }
                    }
                    saveConversation(updatedConversation);
                    const updatedConversations: Conversation[] = conversations.map(
                        (conversation) => {
                            if (conversation.id === selectedConversation.id) {
                                return updatedConversation;
                            }
                            return conversation;
                        },
                    );
                    if (updatedConversations.length === 0) {
                        updatedConversations.push(updatedConversation);
                    }
                    homeDispatch({field: 'conversations', value: updatedConversations});
                    saveConversations(updatedConversations);
                    homeDispatch({field: 'messageIsStreaming', value: false});
                } else {
                    const {answer} = await response.json();
                    const updatedMessages: Message[] = [
                        ...updatedConversation.messages,
                        {role: 'assistant', content: answer},
                    ];
                    updatedConversation = {
                        ...updatedConversation,
                        messages: updatedMessages,
                    };
                    homeDispatch({
                        field: 'selectedConversation',
                        value: updateConversation,
                    });
                    saveConversation(updatedConversation);
                    const updatedConversations: Conversation[] = conversations.map(
                        (conversation) => {
                            if (conversation.id === selectedConversation.id) {
                                return updatedConversation;
                            }
                            return conversation;
                        },
                    );
                    if (updatedConversations.length === 0) {
                        updatedConversations.push(updatedConversation);
                    }
                    homeDispatch({field: 'conversations', value: updatedConversations});
                    saveConversations(updatedConversations);
                    homeDispatch({field: 'loading', value: false});
                    homeDispatch({field: 'messageIsStreaming', value: false});
                }
            }
        },
        [
            // apiKey,
            conversations,
            // pluginKeys,
            selectedConversation,
            sendChatRequest,
            homeDispatch,
            stopConversationRef,
        ],
    );

    const scrollToBottom = useCallback(() => {
        if (autoScrollEnabled) {
            messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
            textareaRef.current?.focus();
        }
    }, [autoScrollEnabled]);

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const {scrollTop, scrollHeight, clientHeight} =
                chatContainerRef.current;
            const bottomTolerance = 30;

            if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
                setAutoScrollEnabled(false);
                setShowScrollDownButton(true);
            } else {
                setAutoScrollEnabled(true);
                setShowScrollDownButton(false);
            }
        }
    };

    const handleScrollDown = () => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth',
        });
    };

    const handleSettings = () => {
        setShowSettings(!showSettings);
    };

    const onClearAll = () => {
        if (
            confirm(t<string>('Are you sure you want to clear all messages?')) &&
            selectedConversation
        ) {
            handleUpdateConversation(selectedConversation, {
                key: 'messages',
                value: [],
            });
        }
    };

    const scrollDown = () => {
        if (autoScrollEnabled) {
            messagesEndRef.current?.scrollIntoView(true);
        }
    };
    const throttledScrollDown = throttle(scrollDown, 250);

    // useEffect(() => {
    //   console.log('currentMessage', currentMessage);
    //   if (currentMessage) {
    //     handleSend(currentMessage);
    //     homeDispatch({ field: 'currentMessage', value: undefined });
    //   }
    // }, [currentMessage]);

    useEffect(() => {
        throttledScrollDown();
        selectedConversation &&
        setCurrentMessage(
            selectedConversation.messages[selectedConversation.messages.length - 2],
        );
    }, [selectedConversation, throttledScrollDown]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setAutoScrollEnabled(entry.isIntersecting);
                if (entry.isIntersecting) {
                    textareaRef.current?.focus();
                }
            },
            {
                root: null,
                threshold: 0.5,
            },
        );
        const messagesEndElement = messagesEndRef.current;
        if (messagesEndElement) {
            observer.observe(messagesEndElement);
        }
        return () => {
            if (messagesEndElement) {
                observer.unobserve(messagesEndElement);
            }
        };
    }, [messagesEndRef]);

    return (
        <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
            {(accessToken == null) ? (
                <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[600px]">
                    <div className="text-center text-xl font-bold text-black dark:text-white">
                        {'ChatGPT ⭐ Twitter Plugin Demo'}
                    </div>
                    <div className="text-center text-lg text-black dark:text-white">
                        <div className="mb-2 font-bold">
                            This project is an early access preview of a <a
                            href="https://openai.com/blog/chatgpt-plugins">ChatGPT plugin</a> under development.
                            {/*<img src="https://i.ibb.co/0tMPx2V/openaigpt4.png" alt="OpenAI logo" style={{height: '1em', width: 'auto'}} />*/}
                        </div>
                        {t(`This UI is a modified clone of OpenAI's ChatGPT UI and built upon `)}<a href="https://github.com/mckaywrigley/chatbot-ui">Chatbot UI.</a>
                    </div>
                </div>
                // )
                // : false ? (
                // <ErrorMessageDiv error={} />
            ) : (
                <>
                    <div
                        className="max-h-full overflow-x-hidden"
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                    >
                        {selectedConversation?.messages.length === 0 ? (
                            <>
                                <div className="mx-auto flex w-[350px] flex-col space-y-10 pt-12 sm:w-[600px]">
                                    <div
                                        className="text-center text-3xl font-semibold text-gray-800 dark:text-gray-100">
                                        {(
                                            'ChatGPT ⭐ Search🌐 and Tweet 🐦'
                                        )}
                                    </div>

                                    {/*{(*/}
                                    {/*    <div*/}
                                    {/*        className="flex h-full flex-col space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">*/}
                                    {/*      <ModelSelect/>*/}

                                    {/*      <SystemPrompt*/}
                                    {/*          conversation={selectedConversation}*/}
                                    {/*          prompts={prompts}*/}
                                    {/*          onChangePrompt={(prompt) =>*/}
                                    {/*              handleUpdateConversation(selectedConversation, {*/}
                                    {/*                key: 'prompt',*/}
                                    {/*                value: prompt,*/}
                                    {/*              })*/}
                                    {/*          }*/}
                                    {/*      />*/}
                                    {/*    </div>*/}
                                    {/*)}*/}
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    className="flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
                                    {t('Model')}: {selectedConversation?.model.name}
                                    <button
                                        className="ml-2 cursor-pointer hover:opacity-50"
                                        onClick={handleSettings}
                                    >
                                        <IconSettings size={18}/>
                                    </button>
                                    <button
                                        className="ml-2 cursor-pointer hover:opacity-50"
                                        onClick={onClearAll}
                                    >
                                        <IconClearAll size={18}/>
                                    </button>
                                </div>
                                {/*{showSettings && (*/}
                                {/*  <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">*/}
                                {/*    <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">*/}
                                {/*      <ModelSelect />*/}
                                {/*    </div>*/}
                                {/*  </div>*/}
                                {/*)}*/}

                                {selectedConversation?.messages.map((message, index) => (
                                    <ChatMessage
                                        key={index}
                                        message={message}
                                        messageIndex={index}
                                    />
                                ))}

                                {loading && <ChatLoader/>}

                                <div
                                    className="h-[162px] bg-white dark:bg-[#343541]"
                                    ref={messagesEndRef}
                                />
                            </>
                        )}
                    </div>

                    <ChatInput
                        stopConversationRef={stopConversationRef}
                        textareaRef={textareaRef}
                        onSend={(message, plugin) => {
                            setCurrentMessage(message);
                            handleSend(message, 0, plugin);
                        }}
                        onRegenerate={() => {
                            if (currentMessage) {
                                handleSend(currentMessage, 2, null);
                            }
                        }}
                    />
                </>
            )}
            {showScrollDownButton && (
                <div className="absolute bottom-0 right-0 mb-4 mr-4 pb-20">
                    <button
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-300 text-gray-800 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-neutral-200"
                        onClick={handleScrollDown}
                    >
                        <IconArrowDown size={18}/>
                    </button>
                </div>
            )}
        </div>
    );
});
Chat.displayName = 'Chat';
