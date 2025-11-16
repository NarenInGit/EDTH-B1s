"""
NewsAPI Disclaimer (Developer Plan - Hackathon Use Only)

- Use NewsAPI for development, testing, demos, or hackathon prototypes only.
- Do NOT deploy publicly, monetize, or store articles permanently.
- Do NOT include your API key in public repos.
- After the hackathon, delete all stored articles and API keys.
- For public or production use, upgrade to a paid NewsAPI plan:
  https://newsapi.org/pricing
"""

# Dependencies: pip install newsapi-python supabase
from newsapi import NewsApiClient
from supabase import create_client, Client
from datetime import datetime

SUPABASE_URL = "YOUR_SUPABASE_URL"
SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY"
API_KEY = "YOUR_NEWSAPI_KEY"

# Trusted news sources
trusted_domains = (
    "bbc.co.uk,"
    "reuters.com,"
    "apnews.com,"
    "nytimes.com,"
    "theguardian.com,"
    "aljazeera.com,"
    "washingtonpost.com"
)

# Ukraine war query
query = "Ukraine war OR Russia invasion OR Ukraine conflict"

def update_news_database():
    # Connect to Supabase
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Connect to NewsAPI
    newsapi = NewsApiClient(api_key=API_KEY)

    # Fetch articles
    articles_response = newsapi.get_everything(
        q=query,
        language="en",
        sort_by="publishedAt",
        page_size=10,
        domains=trusted_domains
    )

    articles = articles_response.get("articles", [])

    # Insert top 5 into Supabase
    for article in articles[:5]:
        supabase.table("news").insert({
            "title": article["title"],
            "description": article["description"],
            "url": article["url"],
            "published_at": datetime.fromisoformat(article["publishedAt"].replace("Z", "+00:00")),
            "source": article["source"]["name"] if "source" in article else None
        }).execute()

if __name__ == "__main__":
    update_news_database()
