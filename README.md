# Repo Counter

## Developing

First, copy the sample into a new file with:

```
cp config-local.sample.json config-local.json
```

Then edit `config-local.json` and input your github username, a personal access token, a github organization, and you can also change the timezone from 'America/New_York' if you like.

Then install deps with:

```
npm install
```

Then run with `npm start`

If it worked, you now have a `repos.csv` and `repos.json` file with all the info about your repos.

