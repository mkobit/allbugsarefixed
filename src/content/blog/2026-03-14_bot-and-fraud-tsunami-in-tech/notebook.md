# Bot and Fraud Tsunami in Tech

## Idea
High fraud rates today create severe friction for legitimate users incorrectly classified by automated systems, a problem compounded by the amplified volume of bot attacks, which forces platforms to deploy increasingly stringent barriers that further complicate human verification and account recovery processes.

## Key observations
* I observed that platforms are struggling with an unprecedented influx of sophisticated AI agents and automated accounts.
* I noted that Digg downsized its team to a small core group, failing to find product-market fit against established social media platforms while grappling with AI bots undermining their voting and engagement systems.
* I read that Mitchell Hashimoto created Vouch, a declarative contributor trust management system for open-source projects, designed to mitigate low-effort drive-by contributions and establish a web of trust.
* I learned that the Vouch system uses a single text file (`.td` files for trust) inside a repository where trusted individuals can vouch for or denounce others.
* I observed that artifact trust systems (like Sigstore or SLSA) do not answer whether a given person should be contributing to a project, a gap Vouch aims to fill.
* I recalled the xz-utils backdoor incident where a contributor ("Jia Tan") spent two years earning trust before planting a severe vulnerability, highlighting the complexity of long-term social engineering attacks.
* I observed that automated agents and SEO spam can quickly discover and flood new platforms, as seen with Digg banning tens of thousands of accounts almost immediately after launch.
* I noted that getting to a human for support on major platforms like Stripe or Google is difficult for users caught in automated fraud detection nets.

## Research questions
* How do the false-positive rates of AI fraud detection models compare across different major payment and social platforms?
* What are the specific hurdles legitimate users face when trying to appeal account suspensions or reinstatements on platforms like Stripe and Google?
* Can a web of trust system like Vouch effectively scale beyond open-source code contributions to broader platform engagement or user identity verification?
* What are the potential gatekeeping effects of explicit trust barriers in open-source ecosystems?
* How can businesses balance the need for aggressive bot mitigation with maintaining accessible human customer support for legitimate users?
* What are the broader business implications when community platforms lose the foundation of trust in their engagement metrics?
* How does the open-source community's perspective on trust and verification differ from a corporate business perspective or an individual user's perspective?
* Are there alternative solutions to explicit vouching systems that could address the "Jia Tan" xz-utils scenario without introducing social credit mechanics?

## References
* [Digg cuts jobs after facing AI bot surge - ETHRWorld.com](https://hr.economictimes.indiatimes.com/amp/news/industry/digg-cuts-jobs-after-facing-ai-bot-surge/129575300)
* [Digg cuts jobs after facing AI bot surge - The Economic Times](https://m.economictimes.com/tech/startups/digg-cuts-jobs-after-facing-ai-bot-surge/amp_articleshow/129568194.cms)
* [Vouch: earn the right to submit a pull request (from Mitchell Hashimoto) : r/devops - Reddit](https://www.reddit.com/r/devops/comments/1qzgoao/vouch_earn_the_right_to_submit_a_pull_request/)
* [Mitchell Hashimoto Launches 'Vouch' to Fight AI Slop in Open Source Ecosystem - It's FOSS](https://itsfoss.com/news/mitchell-hashimoto-vouch/)
