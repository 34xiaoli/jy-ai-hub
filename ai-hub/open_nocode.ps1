$cmd = "$env:USERPROFILE\.meituan-catpaw\bin\paw.cmd"
$json = '{"action":"navigate","url":"https://nocode.meituan.com"}'
Start-Process -FilePath $cmd -ArgumentList "browser-action", $json -NoNewWindow -Wait
