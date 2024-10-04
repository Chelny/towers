# TODO List

## User

- Add localization
- Add predefined avatars or let users upload their picture
- Sign in with passkey
- Double check account deletion date (timezone) in email

## Room

### Invitation Request

- Accept table invitation
- Decline table invitation: Emit socket event + send decline reason to the other user

### Create Table

- Endpoint + socket event

### Player Information

- Send private message endpoint

## Table

### Sidebar

- Boot user endpoint + socket event
- Invite user socket event + only show users not in the table

### Game

- Attacks should be sent to the opponents’ board
- Seated user from teams 2-4 must play their game from team 1’s seat
- Should conside other team player’s board when placing pieces

### Chat

- \*\*\* [username]’s old rating: 2050; new rating: 2040
- Cipher key:
  - Cipher key text: for each Towers made on game board. Example: "\*\*\* V ==> M"
  - Code after winning 25 games in the space of 2 hours: "2FKK 2OF W1VAM2FO 91MO 8EWOF2 NF9 7HW3FE" (no asterisks at the beginning)
  - Hero text: Click on chat input, click on TAB then type. Shouldn’t see it typed anywhere. Example: "\*\*\* [username] is a hero of Yahoo! Towers."
- Host of the table text: "\*\*\* You are the host of the table. This gives you the power to invite to [or boot people from] your table. You may also limit other player’s access to your table by selecting its "Table Type"."
- Table type:
  - Protected table text: "\*\*\* Only people you have invited may play now."
  - Private table text: "\*\*\* Only people you have invited may play or watch your table now."
