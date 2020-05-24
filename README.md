# junit-report-annotations-action
Create an annotations for test results and send a message to slack for each failed test

## Example
```
    - uses: ashley-taylor/junit-report-annotations-action@v1.0
      if: always()
      with:
        access-token: ${{ secrets.GITHUB_TOKEN }}
        slack-bot-token: ${{ secrets.SLACK_BOT_TOKEN }}
        slack-channel-id: Cxxxxxxxx
``` 
   
