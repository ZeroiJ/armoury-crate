'use client';

const BUNGIE_AUTH_URL = 'https://www.bungie.net/en/OAuth/Authorize';

function startAuth() {
  const clientId = process.env.NEXT_PUBLIC_BUNGIE_CLIENT_ID;

  if (!clientId) {
    alert('Missing BUNGIE_CLIENT_ID');
    return;
  }

  // Generate and store state for CSRF protection
  const state = crypto.randomUUID();
  localStorage.setItem('authorizationState', state);

  const url = new URL(BUNGIE_AUTH_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);

  window.location.href = url.toString();
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-24 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {/* Header/Logo Area */}
      </div>

      <div className="relative flex flex-col place-items-center text-center">
        <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl mb-4 bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
          Armoury Vault
        </h1>
        <p className="mt-4 text-xl text-gray-400 max-w-2xl">
          Secure, High-Performance Destiny 2 Backend &amp; Dashboard.
          <br />
          Powered by Next.js.
        </p>

        <div className="mt-10">
          <button
            onClick={startAuth}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 bg-white text-black font-semibold hover:text-white cursor-pointer"
          >
            Login with Bungie
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </button>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left mt-20 gap-8">
        <FeatureCard
          title="Secure"
          desc="OAuth 2.0 with Bungie.net for safe authentication."
        />
        <FeatureCard
          title="Fast"
          desc="Edge-deployed on Cloudflare Pages."
        />
        <FeatureCard
          title="Open Source"
          desc="Built with Next.js and TypeScript."
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="group rounded-lg border border-gray-700 px-5 py-4 transition-colors hover:border-gray-500 hover:bg-gray-800/50">
      <h2 className={`mb-3 text-2xl font-semibold`}>
        {title}{" "}
      </h2>
      <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
        {desc}
      </p>
    </div>
  )
}
