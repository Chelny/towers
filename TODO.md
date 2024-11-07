# TODO List

## User

- Add localization
- Add predefined avatars or let users upload their picture
- Sign in with passkey (currently experimental and not yet recommended for production use)
- Double check account deletion date (timezone) in email
- Prevent user from accessing their account when in a game room (show prompt on click)

## Room

- Prevent user from accessing a room directly by its URL (eg.: full rooms)

### Invitation Request

- Accept table invitation
- Decline table invitation: Emit socket event + send decline reason to the other user

### Create Table

- Update: endpoint + socket event

### Player Information

- Send private message endpoint

## Table

- Prevent user from accessing a table directly by its URL (eg.: private tables)
- FIXME: In HTML, <form> cannot be a descendant of <form>
- FIXME: POST /api/tables/$tableId/chat 409

### Sidebar

- Boot user endpoint + socket event
- Invite user socket event + only show users not in the table

### Game

- Attacks should be sent to the opponents’ board
- Seated user from teams 2-4 must play their game from team 1’s seat
- Should consider other team player’s board when placing pieces

### Chat

- Ratings update: \*\*\* [username]’s old rating: 2050; new rating: 2040
- Cipher key:
  - Cipher key text: for each Towers made on game board. Example: "\*\*\* V ==> M"
  - Code after winning 25 games in the space of 2 hours: "2FKK 2OF W1VAM2FO 91MO 8EWOF2 NF9 7HW3FE" (no asterisks at the beginning)
  - Hero message: Click on chat input, click on TAB then type. Shouldn’t see it typed anywhere. Example: "\*\*\* [username] is a hero of Yahoo! Towers."

## Server

- Manage errors for specific user in a specific room
