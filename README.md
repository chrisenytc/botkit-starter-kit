```bash
                 ___       __       _______ .______       _______  _______
                /   \     |  |     |   ____||   _  \     |   ____||       \
               /  ^  \    |  |     |  |__   |  |_)  |    |  |__   |  .--.  |
              /  /_\  \   |  |     |   __|  |      /     |   __|  |  |  |  |
             /  _____  \  |  `----.|  |     |  |\  \----.|  |____ |  '--'  |
            /__/     \__\ |_______||__|     | _| `._____||_______||_______/
```

> A bot to help our teams automate things

## Getting Started

1º Clone alfred repo

```bash
$ git clone git@github.com:hashlab/alfred.git
```

2º Enter in alfred directory
```bash
$ cd alfred
```

3º Run the setup script
```bash
$ script/setup
```

4º Configure the environment variables
```bash
$ nvim .env
```

5º Run the bot
```bash
$ make start
```

## Conventions of commit messages

Addding files on repo

```bash
git commit -m "Add filename"
```

Updating files on repo

```bash
git commit -m "Update filename, filename2, filename3"
```

Removing files on repo

```bash
git commit -m "Remove filename"
```

Renaming files on repo

```bash
git commit -m "Rename filename"
```

Fixing errors and issues on repo

```bash
git commit -m "Fixed #issuenumber Message about this fix"
```

Adding features on repo

```bash
git commit -m "Add feature: nameoffeature Message about this feature"
```

Updating features on repo

```bash
git commit -m "Update feature: nameoffeature Message about this update"
```

Removing features on repo

```bash
git commit -m "Remove feature: nameoffeature Message about this"
```
