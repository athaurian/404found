# Contributor Attribution

GitHub builds the **Contributors** list on the repository home page from commit author email addresses. Repository access settings do not affect this list.

## Attribution Rules

| Commit author email                          | Result                                                                     |
| :------------------------------------------- | :------------------------------------------------------------------------- |
| Matches a verified email on a GitHub account | GitHub attributes the commit to that account                               |
| Matches no verified email                    | GitHub counts the commit under the author name as an anonymous contributor |
| Commit with no file changes                  | GitHub excludes the commit from contributor counts                         |

## Team Accounts

| Member                   | GitHub account | Track    |
| :----------------------- | :------------- | :------- |
| Hanif Ilham Athaurrahman | `@athaurian`   | Backend  |
| Salva Faddil Rinaldi     | `@salvafaddil` | Frontend |
| Ilham Ligar Samudra      | `@Ilham12359`  | Frontend |

## Configure Commit Identity

Set the GitHub noreply address as the author email in each local clone. Read the numeric account id from `https://api.github.com/users/<username>`.

```bash
git config user.name "<display name>"
git config user.email "<id>+<username>@users.noreply.github.com"
```

Earlier commits keep their original author email. To attribute earlier commits to an account, rewrite the author field and force-push the branch after coordinating with the team.
