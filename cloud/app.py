import os
import json
from requirements import youtube_dl 
from requirements import boto3

import helper

S3_BUCKET = os.environ.get('S3_BUCKET')

s3 = boto3.resource('s3')
client = boto3.client('s3')


def listSongs(event, context):
    bucket = s3.Bucket(S3_BUCKET)
    songs = list()
    for obj in bucket.objects.all():
        response = client.head_object(Bucket=S3_BUCKET,Key=obj.key)
        objData = response['ResponseMetadata']['HTTPHeaders']
        song = {
            'videoId' : objData['x-amz-meta-videoid'],
            'title' : objData['x-amz-meta-title'],
            'cloudUrl' : objData["x-amz-meta-cloudurl"]
        }
        songs.append(song)
    return packageResponse(songs)

def uploadSong(event, context):
    source = event['pathParameters']['source']
    payload = 'Nothing'
    if(source == 'youtube'):
            videoId = event['queryStringParameters']['video']
            payload = uploadSongFromYoutube(videoId)
    return packageResponse(payload)

def packageResponse(payload):
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT,POST,GET'
        },
        "body": json.dumps(payload)
    }
def format_cloudUrl(key):
    return 'https://{}.s3.eu-central-1.amazonaws.com/{}'.format(S3_BUCKET,key)
def uploadSongFromYoutube(videoId):
    url = 'https://www.youtube.com/watch?v=' + videoId
    filename = '/tmp/videos/' + videoId + '.mp4'
    ydl_opts = {
    'outtmpl': filename
}
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            songInfo = ydl.extract_info(url, download=True)
            key = helper.format_filename(songInfo['title']) + '.mp4'
            songImage = songInfo['thumbnails'].pop()['url']

            song = {
                'videoId':videoId,
                'title' : songInfo['title'],
                'image' : songImage,
                'cloudUrl': format_cloudUrl(key)
            }
            s3.meta.client.upload_file(filename, S3_BUCKET, key, ExtraArgs={'ACL': 'public-read','ContentType': 'video/mp4','Metadata':song})
            return song
