from youtube_transcript_api import YouTubeTranscriptApi 
#https://www.youtube.com/watch?v=_xIwjmCH6D4
# assigning srt variable with the list 
# of dictionaries obtained by the get_transcript() function
srt = YouTubeTranscriptApi.get_transcript("TZ0bPXFHiiY")

# prints the result
print(srt)
