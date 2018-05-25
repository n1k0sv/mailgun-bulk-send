# Mailgun Bulk Sender

A command line utility to send one-off emails to a large set of users through
Mailgun written in node.js (v8+).

## How to use


### 1. Install dependencies

In the project folder do

```
npm install
```

### 2. Create a configuration file

Make a copy the sample config file:

```
cp config.sample.json config.json
```

### 3. Edit the configuration file

Update `config.json` and enter the Mailgun domain and api key.

## Sending campaigns

To send a campaign you will need a set of files that describe the campaign:

```
subject.txt: One liner for email subject
body.html: HTML version of the email
body.txt: Text version of the email
users.csv: A list of users to send to
```

See the `examples/` folder for sample data.

### Quick start

Type `npm start -- --sendit` to start an interactive input of your data files or `npm start -- -h` for a list of command line arguments.

The utility will batch send the email using the Mailgun batch API.

Note that unless the `--sendit` command line argument is specified no email
will be actually sent (fake mode by default).

### Recipient variables

TODO

### Advanced usage

#### Mailgun testmode

Mailgun supports [test mode](https://documentation.mailgun.com/en/latest/user_manual.html#manual-testmode) in order to consume the send API request but not
actually send it. To enable test mode set `mailgun.testmode` to `true` in the
`config.json`.

> Note that Mailgun charges for test mode

#### Mailgun tags

Mailgun supports [tagging](https://documentation.mailgun.com/en/latest/user_manual.html#tagging) for categorizing email traffic. To add tags to the emails sent, populate the `mailgun.tags` array in the `config.json`.

### More examples

TODO
