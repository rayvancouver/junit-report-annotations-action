# junit-report-annotations-action
Create annotations for test results and send a message to slack for each failed test

## Example
```
    - uses: depsypher/junit-report-annotations-action@v2
      if: always()
      with:
        access-token: ${{ secrets.GITHUB_TOKEN }}
        slack-bot-token: ${{ secrets.SLACK_BOT_TOKEN }}
        slack-channel-id: Cxxxxxxxx
``` 
   
