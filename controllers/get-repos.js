const ENV_VARS = require("dotenv").config().parsed;

const axiosGitHubGraphQL = require("axios").default.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${ENV_VARS.GITHUB_PERSONAL_ACCESS_TOKEN}`,
  },
});

const USERNAME = "diogoneves07";

function fetchFromGithubGraphql() {
  const query = `{
  user(login: "${USERNAME}") {
    repositories(first: 50, isFork: false) {
      nodes {
        name
        url
        isPrivate
        isArchived
        updatedAt
      }
    }
    pinnedItems(first:20, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          url
          isPrivate
          isArchived
          updatedAt
        }
      }
    }
  }
}`;
  return axiosGitHubGraphQL.post("", { query });
}

module.exports = fetchFromGithubGraphql;
