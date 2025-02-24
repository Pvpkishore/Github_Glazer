import React, { useState, useEffect } from "react";
import axios from "axios";
import github from "./assets/github.svg";
import gsap from "gsap";

const App: React.FC = () => {
  const [username, setUsername] = useState("");
  const [response, setResponse] = useState("");
  const [responseReceived, setResponseReceived] = useState(false);
  const [responseSet, setResponseSet] = useState(false);
  const [glazing, setGlazing] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      ".animate-fade-in",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
    );
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleButtonClick = async () => {
    if (responseSet) {
      setUsername("");
      setResponse("");
      setResponseReceived(false);
      setResponseSet(false);
    } else if (username === "") {
      alert("GitHub username can't be empty.");
    } else {
      setGlazing(true);
      const githubApiKey = import.meta.env.VITE_GITHUB_API_KEY;
      const openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      const siteUrl = "https://github-glazer-kishore.vercel.app/"; // Replace with your actual site URL
      const siteName = "Github Glazer"; // Replace with your actual site name

      try {
        const headers = {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${githubApiKey}`,
        };
        let response = await fetch(`https://api.github.com/users/${username}`, { headers });

        if (response.status === 404) {
          setResponseSet(true);
          setResponse("User not found. Please try again.");
        } else if (response.ok) {
          const profileResponse = await response.json();
          response = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated`,
            { headers }
          );
          const repoResponse = await response.json();

          let readmeResponse = " ";
          try {
            const readmeData = await axios.get(
              `https://raw.githubusercontent.com/${username}/${username}/main/README.md?raw=true`
            );
            readmeResponse = readmeData.data;
          } catch (error) {
            console.error("Error fetching user's README.md:", error);
          }

          const datas = {
            name: profileResponse.name,
            bio: profileResponse.bio,
            company: profileResponse.company,
            location: profileResponse.location,
            followers: profileResponse.followers,
            following: profileResponse.following,
            public_repos: profileResponse.public_repos,
            profile_readme: readmeResponse,
            last_15_repositories: repoResponse.map((repo: any) => ({
              name: repo.name,
              description: repo.description,
              language: repo.language,
              stargazers_count: repo.stargazers_count,
              open_issues_count: repo.open_issues_count,
              license: repo.license,
              fork: repo.fork,
            })).slice(0, 15),
          };

          const prompt = `Give a short and wholesome compliment session with a little witty sarcasm for the following GitHub profile: ${username}. Here are the details: "${JSON.stringify(datas)}"`;

          try {
            const completionResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${openRouterApiKey}`,
                "HTTP-Referer": siteUrl,
                "X-Title": siteName,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "deepseek/deepseek-r1:free",
                messages: [
                  {
                    role: "system",
                    content:
                      "You glaze people's GitHub accounts based on their bio, name, README, and repos as wholesomely and nicely as possible with a twinge of sarcasm. Keep it around 250-300 words, full of internet humor and encouragement.",
                  },
                  { role: "user", content: prompt },
                ],
              }),
            });
            const completion = await completionResponse.json();
            const glaze = completion.choices?.[0]?.message?.content;
            setResponse(glaze || "Our glazers are recharging, try again later :(");
            setResponseSet(true);
          } catch (error) {
            console.error("Error generating compliment:", error);
            setResponseSet(true);
            setResponse("There was an error generating the compliment. Please try again later.");
          }

          setGlazing(false);
        } else {
          setResponseSet(true);
          setResponse("Our glazers are busy elsewhere, try again later.");
          setGlazing(false);
        }
      } catch (error) {
        console.error("Error:", error);
        setResponseSet(true);
        setResponse("Our glazers are busy elsewhere, try again later.");
        setGlazing(false);
      }
      setResponseReceived(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-slate-900 text-white font-poppins space-y-10">
  {/* Header Section */}
  <header className="w-full text-center">
    <a href="#" className="group">
      <h1 className="md:text-6xl  text-4xl font-bold mb-4 group-hover:text-blue-500 transition duration-300 ease-in-out transform group-hover:scale-105 animate-fade-in">
        GitHub Glazer
      </h1>
      <p className="text-xl mb-1 animate-fade-in text-gray-400">
        Transform your GitHub profile into a masterpiece
      </p>
    </a>
  </header>

  {/* Input Section */}
  <section className="flex flex-col items-center w-full max-w-fit space-y-4">
    <p className="md:text-2xl text-md text-center animate-fade-in">
      Enter a GitHub username to get started
    </p>
    <input
      type="text"
      placeholder="Enter a username"
      value={username}
      onChange={handleInputChange}
      className="w-full px-4 py-3 text-lg bg-gray-800 border border-blue-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out animate-fade-in"
    />
    <button
      onClick={handleButtonClick}
      className="w-full px-6 py-3 bg-blue-600 rounded-lg text-lg font-semibold text-white hover:bg-blue-500 transform hover:scale-105 transition-all duration-300 ease-in-out animate-fade-in shadow-lg"
    >
      {responseSet ? "Clear" : "Glaze"}
    </button>
  </section>

  {/* Response Display */}
  <section className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-lg animate-fade-in">
    {responseReceived ? (
      <div className="text-lg font-semibold leading-relaxed text-gray-200">{response}</div>
    ) : (
      <div className="text-lg font-semibold text-gray-400 leading-relaxed">
        {glazing ? "Glazing your GitHub!" : "Enter a username to start glazing"}
      </div>
    )}
  </section>

  {/* Contact Info */}
  <section className="flex flex-col items-center space-y-3 text-lg animate-fade-in">
    <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
      <img
        src={github}
        alt="GitHub Logo"
        className="w-10 h-10 transition-transform duration-300 ease-in-out transform hover:scale-110"
      />
    </a>
    <p className="text-center text-gray-400">
      Contact creator at{" "}
      <a
        href="https://www.linkedin.com/in/ponnala-venkata-padma-kishor-76679326a/"
        target="_blank"
        className="text-blue-400 hover:underline transition duration-300 ease-in-out"
        rel="noopener noreferrer"
      >
        Pvpkishore
      </a>
    </p>
  </section>

  {/* Footer */}
  <footer className="w-full mt-10 mb-0 py-4 text-center md:text-md text-sm p-2 text-gray-500 bg-slate-800 animate-fade-in">
    <p>
      © {new Date().getFullYear()} GitHub Glazer. Built with ❤️ by Pvpkishore.
    </p>
  </footer>
</div>

  );
};

export default App;
