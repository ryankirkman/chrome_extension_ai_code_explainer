document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({ action: 'getSelectedText' }, function (response) {
        document.getElementById('explanation').innerText = 'Loading...';
        getExplanation(response.text);
    });
});

function getSettings() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['apiKey', 'model', 'maxTokens', 'temperature', 'liveResponse'], function (data) {
            resolve(data);
        });
    });
}

async function getExplanation(code) {
    const outputText = document.getElementById('explanation');
    try {
        const { apiKey, model, maxTokens, temperature, liveResponse } = await getSettings();
        if (!apiKey) {
            throw new Error('API Key is not configured. Please configure it in the extension options.');
        }
        const apiUrl = 'https://api.openai.com/v1/chat/completions';
        const messages = [
            { role: "system", content: "You are an AI that can explain code in simple terms." },
            { role: "user", content: `Explain the following code in simple terms: ${code}` },
        ];
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: {
                model: model,
                messages: messages,
                max_tokens: maxTokens,
                temperature: temperature,
            }
        };

        let fetchFunction = fetchSync;
        if (liveResponse) {
            options.body.stream = true;
            fetchFunction = fetchAsync;
        }
        options.body = JSON.stringify(options.body);
        const response = await fetch(apiUrl, options);
        fetchFunction(response, outputText);
    } catch (error) {
        alert(error);
        console.error(error);
        throw error;
    }
}

function fetchAsync(response, outputText) {
    outputText.innerText = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    async function readStream() {
        try {
            const { value, done } = await reader.read();

            if (done) {
                return;
            }

            buffer += decoder.decode(value, { stream: true });

            while (buffer.includes('\n')) {
                const newLineIndex = buffer.indexOf('\n');
                const eventStr = buffer.slice(0, newLineIndex).trim();
                buffer = buffer.slice(newLineIndex + 1);

                if (eventStr.startsWith('data: ')) {
                    const dataStr = eventStr.slice('data: '.length);

                    if (dataStr === '[DONE]') {
                        // Close the stream if the [DONE] message is received
                        break;
                    } else {
                        const jsonResponse = JSON.parse(dataStr);
                        if (jsonResponse.choices && jsonResponse.choices.length > 0 && jsonResponse.choices[0].delta.content) {
                            outputText.innerText += jsonResponse.choices[0].delta.content;
                        }
                    }
                }
            }

            readStream();
        } catch (error) {
            console.error('Error reading the stream:', error);
        }
    }

    readStream();
}

async function fetchSync(response, outputText) {
    if (!response.ok) {
        throw new Error('API request failed');
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
        const aiMessage = data.choices[0].message.content;
        outputText.innerText = aiMessage;
    } else {
        throw new Error('No explanation found');
    }
}