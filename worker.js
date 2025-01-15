/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


export default {
    async fetch(request, env, ctx) {
        if (request.method !== "POST") {
            return new Response("Method not allowed", {
                status: 405,
            });
        }
        const token = request.headers.get('CF-TURNSTILE-TOKEN');
        const ip = request.headers.get('CF-Connecting-IP');

        // Validate the token by calling the "/siteverify" API.
        let formData = new FormData();
        formData.append('secret', env.SECRET_KEY);
        formData.append('response', token);
        formData.append('remoteip', ip);

        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            body: formData,
            method: 'POST',
        });

        const outcome = await result.json();
        console.log(outcome)
        if (!outcome.success) {
            return new Response(JSON.stringify({...outcome, message: 'The provided Turnstile token was not valid!'}), {status: 400});
        }
        // The Turnstile token was successfuly validated. Proceed with your application logic.
        // Validate login, redirect user, etc.
        // For this demo, we just echo the "/siteverify" response:
        return new Response(JSON.stringify({...outcome, message: 'Turnstile token successfuly validated.'}), {status: 200});
    },
};