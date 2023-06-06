// pages/home.tsx

import Head from 'next/head';
import Image from 'next/image';
import {useRouter} from "next/router";

const HomePage = () => {
    const router = useRouter();

    const handleLogin = async () => {
        const redirectURI = encodeURIComponent(`https://www.rolebotics.com/chat`);
        const loginURL = `https://gptweet.rolebotics.com/auth0/login?redirect_uri=${redirectURI}`;
        router.push(loginURL);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-black text-white">
            {/*<div className="flex flex-col items-center justify-center min-h-screen py-2">*/}
            <Head>
                <title>ChatGPT Twitter Plugin</title>
                <link rel="icon" href="/favicon.ico"/>
                <link
                    rel="stylesheet"
                    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
                />
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
            </Head>

            <main className="container">
                <h1 className="mt-5 mb-3">
                    <Image
                        src="/images/rolebotics-logo.png"
                        alt="Logo"
                        width={200}
                        height={200}
                    />
                </h1>
                <p>
                    <b>GPTweet</b> - ChatGPT ⭐ is a Twitter Plugin that allows ChatGPT to interact with your Twitter account and tailor your social media experience with AI wizardry.
                </p>
                <h2 className="mt-5 mb-3">Usage Examples</h2>
                <ul>
                    <li> Compose and post a new tweet with ChatGPT's assistance</li>
                    <li> Reply to a tweet in a specific thread </li>
                    <li> Get notified of mentions and replies you care about</li>
                    <li>View a user's profile information</li>

                </ul>
                <h2 className="mt-5 mb-3">Benefits</h2>
                <ul>
                    <li>Easy integration with ChatGPT</li>
                    <li>
                        Manage your Twitter account with the help of ChatGPT's AI
                        capabilities
                    </li>
                    <li>Improve your social media presence with more engaging content</li>
                </ul>
                <h2 className="mt-5 mb-3">Installation and Requirements</h2>
                <p>To use the ChatGPT Twitter Plugin, you will need the following:</p>
                <ul>
                    <li>A ChatGPT account</li>
                    <li>A Twitter account</li>
                </ul>
                <p className="mb-3">
                    Please note that while the website is publicly available, the sign-in functionality is currently
                    under development and not operational. We appreciate your understanding.
                </p>
                <div className="mt-8">
                    <button
                        className="bg-[#3BACED] text-white font-bold py-2 px-4 rounded flex items-center"
                        onClick={handleLogin}
                    >
                        Sign In
                        <div className="ml-2">
                            <Image
                                src="/images/Screenshot 2023-04-13 at 12.26.41.png" // Update with the path to your image
                                alt="social login twitter"
                                width={40} // Update with your desired width
                                height={40} // Update with your desired height
                            />
                        </div>
                    </button>
                </div>

                <p>Coming soon to ChatGPT plugin store </p>
            </main>
        </div>
    );
};

export default HomePage;
