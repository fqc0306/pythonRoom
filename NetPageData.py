#!/usr/local/bin/python
import urllib2
from bs4 import BeautifulSoup
import csv
import json

class Student(object):
    def __init__(self, name, age, score):
        self.name = name
        self.age = age
        self.score = score
def student2dict(std):
    return {
        'name': std.name,
        'age': std.age,
        'score': std.score
    }

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

def delTag(x):
	arr = []
	for i in range(0, x.__len__()):
		b = str(x[i]).replace('<td align="center" id="desc" width="50%">', '')
		c = b.replace('</td>', '')
		c = c.replace('\r\n\t\t', '')
		c = c.replace(',', '')
		arr.append(c)
	return arr

def writeCsv(x):
	with open('NetPageData.csv', 'ab+') as csvfile:
		writer = csv.writer(csvfile, dialect='excel')
	writer.writerow(x)

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



	# data =  delTag(findResult)

	# print ("------------------")

	# if len(data)>13: 
	# 	room = [None]*(12)
	# 	a1 = float(data[7].split(' ')[0])
	# 	b1 = float(data[9].split(' ')[0])
	# 	a2 = float(data[11].split(' ')[0])
	# 	b2 = float(data[13].split(' ')[0])

	# 	room[0] = data[0]
	# 	room[1] = data[1]
	# 	room[2] = data[6]
	# 	room[3] = data[7].split(' ')[0]
	# 	room[4] = data[8]
	# 	room[5] = data[9].split(' ')[0]
	# 	room[6] = data[10]
	# 	room[7] = data[11].split(' ')[0]
	# 	room[8] = data[12]
	# 	room[9] = data[13].split(' ')[0]
	# 	room[10] = 'total'
	# 	room[11] = round(a1*a2/10000.0, 3)
	# 	print (room)

	# 	writeJson(room)
	# 	# writeCsv(room)
	# else:
	# 	print ("length error:"+str(len(data)))

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
