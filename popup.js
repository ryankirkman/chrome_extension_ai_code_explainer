document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({ action: 'getSelectedText' }, function (response) {
        document.getElementById('explanation').innerText = 'Loading...';
        getExplanation(response.text)
            .then((explanation) => {
                document.getElementById('explanation').innerText = explanation;
            })
            .catch((error) => {
                console.error(error);
            });
    });
});

function getSettings() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['apiKey', 'model', 'maxTokens', 'temperature'], function (data) {
            resolve(data);
        });
    });
}

async function getExplanation(code) {
    try {
        const { apiKey, model, maxTokens, temperature } = await getSettings();
        if (!apiKey) {
            throw new Error('API Key is not configured. Please configure it in the extension options.');
        }
        const apiUrl = 'https://api.openai.com/v1/chat/completions';
        const messages = [
            { role: "system", content: "You are an AI that can explain code in simple terms." },
            { role: "user", content: `Explain the following code in simple terms: ${code}` },
        ];

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: maxTokens,
                temperature: temperature,
            }),
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            const aiMessage = data.choices[0].message.content;
            return aiMessage.trim();
        } else {
            throw new Error('No explanation found');
        }
    } catch (error) {
        alert(error);
        console.error(error);
        throw error;
    }
}