import sys
import requests

APP_ID = '888522539054301264'
GUILD_ID = '514280909537542158'

if not sys.argv[1]:
  print('BOT_TOKEN missing')
  sys.exit(1)

BOT_TOKEN = sys.argv[1]

SUB_COMMAND = 1
SUB_COMMAND_GROUP = 2
STRING = 3
INTEGER = 4
BOOLEAN = 5
USER = 6
CHANNEL = 7
ROLE = 8
MENTIONABLE = 9 # Includes users and roles
NUMBER = 10 # Any double between -2^53 and 2^53

# guild commands update instantly
url = f'https://discord.com/api/v8/applications/{APP_ID}/guilds/{GUILD_ID}/commands'

def set_commands(commands):
  for command in commands:
    response = requests.post(url, headers={
      'Authorization': f'Bot {BOT_TOKEN}'
    }, json=command)
    print(response.json())
    if 'default_permission' in command and command['default_permission'] is False:
      set_command_permission(response.json())

def set_command_permission(command, permission_id = '541714482649366585'):
  command_id=command['id']
  command_name=command['name']

  response = requests.put(f'{url}/{command_id}/permissions', headers={
    'Authorization': f'Bot {BOT_TOKEN}'
  }, json={
    'permissions': [
      {
        'type': 1,
        'permission': True,
        'id': permission_id
      }
    ]
  })

  print(f'Setting command "{command_name}" permissions to "Moderator": {response.status_code}')

def delete_command(command_id):
  response = requests.delete(f'{url}/{command_id}', headers={
    'Authorization': f'Bot {BOT_TOKEN}'
  })

  print(f'deleted command "{command_id}": {response.status_code}')

set_commands([
  {
    'name': 'roll',
    'description': 'Roll a ten-sided dice.',
    "options": [
      {
        'type': 	4,
        'name': 'amount',
        'description': 'The amount of dice to roll.',
        'required': True
      }
    ]
  }
])