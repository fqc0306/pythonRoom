#!/usr/local/bin/python
import urllib2
from bs4 import BeautifulSoup
import csv
import json

class Room(object):
	def __init__(self, number, in_square, out_square):
		self.number = number
		self.in_square = in_square
		self.out_square = out_square

def obj_2_json(obj):
	return {
		'number':obj.number,
		'in_square':obj.in_square,
		'out_square':obj.out_square
	}

def writeJson(data):

	# str = json.dumps(data)
	# result = str.decode("unicode-escape").decode("unicode-escape")

	with open('data.json', 'ab+') as f:
		json.dump(data, f)
		f.write('\n')

def getItem(x):
	downjoyMainUrl = x
	print (downjoyMainUrl)

	opener = urllib2.build_opener()
	headers = {
	  'User-Agent': 'Mozilla/5.0 (Windows NT 5.1; rv:10.0.1) Gecko/20100101 Firefox/10.0.1',
	}
	opener.addheaders = headers.items()
	response = opener.open(downjoyMainUrl)

	html=response.read().decode('utf-8')
	soup = BeautifulSoup(html, "html.parser", from_encoding="utf-8")

	desc = soup.find_all(id='desc')

	if desc.__len__() > 13:
		room = Room(desc[1].text.split(' ')[0], desc[7].text.split(' ')[0], desc[9].text.split(' ')[0])
		roomJson = json.dumps(room, default = obj_2_json, ensure_ascii=False)
		writeJson(roomJson)
	else:
		print("length error:" + str(len(desc)))

def getAllRoom(url):

	opener = urllib2.build_opener()
	headers = {
	  'User-Agent': 'Mozilla/5.0 (Windows NT 5.1; rv:10.0.1) Gecko/20100101 Firefox/10.0.1',
	}
	opener.addheaders = headers.items()
	response = opener.open(url)

	html = response.read().decode('utf-8')
	soup = BeautifulSoup(html, "html.parser", from_encoding="utf-8")

	tables = soup.find_all(id="table_Buileing")
	alldivs = tables[0].find_all("div")

	for i in alldivs:
		print ("------------------")
		style = i.get("style")

		print(style.split(";")[1])
		link = i.find("a")
		print(link.text)
		print(link.get("href"))
		href = "http://bjjs.zjw.beijing.gov.cn" + link.get("href")
		getItem(href)
		print ("------------------")

	print(alldivs.__len__())



allRoomUrl = 'http://bjjs.zjw.beijing.gov.cn/eportal/ui?pageId=393547&systemId=2&categoryId=1&salePermitId=6529681&buildingId=501668'
getAllRoom(allRoomUrl)

#for i in range(12406512, 12406599):
# for i in range(13567564,13567573):
# 	room = str(i)
# 	url = 'http://bjjs.zjw.beijing.gov.cn/eportal/ui?pageId=393549&houseId=' + room + '&categoryId=1&salePermitId=6529681&systemId=2'
# 	getItem(url)
