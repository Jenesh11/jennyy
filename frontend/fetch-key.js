// Native fetch (Node 18+)
async function getPublishableKey() {
    const baseUrl = "http://localhost:9000";

    try {
        console.log("Logging in as admin...");
        const authRes = await fetch(`${baseUrl}/admin/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "admin@medusa-test.com",
                password: "supersecret"
            })
        });

        if (!authRes.ok) {
            console.log("LOGIN_FAILED:" + authRes.status);
            return;
        }

        const cookie = authRes.headers.get('set-cookie');

        console.log("Fetching keys...");
        const keysRes = await fetch(`${baseUrl}/admin/publishable-api-keys`, {
            headers: {
                cookie: cookie
            }
        });

        if (!keysRes.ok) {
            console.log("FETCH_FAILED:" + keysRes.status);
            return;
        }

        const data = await keysRes.json();
        const keys = data.publishable_api_keys;

        if (keys && keys.length > 0) {
            console.log("SUCCESS_KEY:" + keys[0].id);
        } else {
            console.log("NO_KEYS_FOUND");
            // Try creating one
            console.log("Creating new key...");
            const createRes = await fetch(`${baseUrl}/admin/publishable-api-keys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    cookie: cookie
                },
                body: JSON.stringify({ title: "Web Storefront" })
            });
            const newData = await createRes.json();
            if (newData.publishable_api_key) {
                console.log("SUCCESS_KEY:" + newData.publishable_api_key.id);
            } else {
                console.log("CREATE_FAILED");
            }
        }

    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

getPublishableKey();
