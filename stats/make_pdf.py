import requests
import json

login = '+'.join(input("Login : ").split(' '))
password = '+'.join(input("Password : ").split(' '))

url = f'https://linfo2142-grpg.info.ucl.ac.be/getdb?login={login}&password={password}'

print(url)

r = requests.get(url, verify=False)

data = json.loads(r.text)['data']

with open('data.json', 'w') as f:
    json.dump(data, f)