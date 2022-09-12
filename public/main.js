const repositories = [];
const repositoriesContainer = document.querySelector(".result-list");
const repositoriesFilters = {
  onlyPrivate: false,
  onlyArchived: false,
  onlyPinned: false,
};
const sortBySelectElement = document.getElementById("select-sort-by");
const dataResultsElement = document.querySelector("[data-results]");
const searchRepositoriesElement = document.getElementById("search-repos-input");

function isMoreRecent(firstUpdatedAt, secondUpdatedAt) {
  return (
    new Date(firstUpdatedAt).getTime() > new Date(secondUpdatedAt).getTime()
  );
}

function searchRepositories(repos) {
  const value = searchRepositoriesElement.value;

  if (!value || value === "*") {
    return repos;
  }

  const fragments =
    value.length > 5 ? [value, ...value.match(/.{1,3}/g)] : [value];

  const result = new Set();

  if (fragments.at(-1).length < 3) {
    const lastItem = fragments.pop();
    const penultimateItem = fragments.pop();
    fragments.push(penultimateItem + lastItem);
  }
  console.log(fragments);
  repos.forEach((repo) => {
    fragments.forEach((frag) => {
      if (repo.name.includes(frag)) {
        result.add(repo);
      }
    });
  });
  return [...result];
}

function updateRepositoriesFilters(value) {
  switch (value) {
    case "onlyPrivate":
      repositoriesFilters.onlyPrivate = !repositoriesFilters.onlyPrivate;
      break;
    case "onlyArchived":
      repositoriesFilters.onlyArchived = !repositoriesFilters.onlyArchived;
      break;
    case "onlyPinned":
      repositoriesFilters.onlyPinned = !repositoriesFilters.onlyPinned;
      break;
    default:
      break;
  }
  mountRepositories();
}

function sortRepositories(repos) {
  return repos.sort((repo, previousRepo) => {
    switch (sortBySelectElement.value) {
      case "Z-a":
        return previousRepo.name.localeCompare(repo.name);
      case "last-commit":
        return isMoreRecent(repo.updatedAt, previousRepo.updatedAt) ? -1 : 1;
      case "old-commit":
        return isMoreRecent(repo.updatedAt, previousRepo.updatedAt) ? 1 : -1;
      default:
        return repo.name.localeCompare(previousRepo.name);
    }
  });
}

function mountRepositories() {
  if (!repositories[0]) return;

  console.log(repositories);
  let html = "";

  sortRepositories(
    searchRepositories(
      repositories.filter((repo) => {
        const { onlyPrivate, onlyArchived, onlyPinned } = repositoriesFilters;
        const all = !onlyPrivate && !onlyArchived && !onlyPinned;
        if (!all) {
          if (
            !(
              (onlyPinned && repo.isPinned) ||
              (onlyArchived && repo.isArchived) ||
              (onlyPrivate && repo.isPrivate)
            )
          ) {
            return false;
          }
        }

        return repo;
      })
    )
  ).forEach((repo) => {
    html += `<a href="${repo.url}" target="_blank"><li>${repo.name}</li></a>`;
  });
  repositoriesContainer.innerHTML = html
    ? html
    : "<li class='waiting-results'>Nenhum resultado foi encontrado!</li>";
}

function saveRepositories(data) {
  repositories.length = 0;

  if (data?.user?.repositories) {
    repositories.push(...data.user.repositories.nodes);
    for (const repo of data.user.pinnedItems.nodes) {
      const check = repositories.find((o) => o.name === repo.name);
      if (check) {
        check.isPinned = true;
      } else {
        repositories.push(repo);
      }
    }
    mountRepositories();
  }
}

function getRepositories() {
  fetch("./", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((r) => r.json())
    .catch(() => {
      if (!repositories[0]) {
        setTimeout(() => {
          getRepositories();
        }, 3000);
      }
    })
    .then((data) => {
      saveRepositories(data);
      return data;
    });
}

addEventListener("submit", (e) => {
  if (!repositories[0]) {
    getRepositories();

    if (!dataResultsElement.classList.contains("show-results")) {
      dataResultsElement.classList.add("show-results");
    }
  } else {
    mountRepositories();
  }

  e.preventDefault();
});

addEventListener("input", (e) => {
  if (e.target.type === "checkbox") {
    updateRepositoriesFilters(e.target.value);
    mountRepositories();
  }
});

addEventListener("change", (e) => {
  if (e.target === sortBySelectElement) {
    mountRepositories();
  }
});
