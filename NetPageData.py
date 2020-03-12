#!/usr/local/bin/python
#coding=utf-8

import urllib2
from bs4 import BeautifulSoup
import csv
import json
import codecs

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
def getSoupByUrl(url):

	opener = urllib2.build_opener()
	headers = {
	  'User-Agent': 'Mozilla/5.0 (Windows NT 5.1; rv:10.0.1) Gecko/20100101 Firefox/10.0.1',
	}
	opener.addheaders = headers.items()
	response = opener.open(url)

	html = response.read().decode('utf-8')
	soup = BeautifulSoup(html, "html.parser", from_encoding="utf-8")

	return soup


#写入乱码问题
def writeCsv(x):
	with open('data.csv', 'ab+') as csvfile:
		writer = csv.writer(csvfile, dialect='excel')
		writer.writerow(x)

def writeJson(data, fileName):

	str = "\n".join(data)
	str = str + "\n"
	f = codecs.open(fileName,'ab+','utf-8')
	f.write(str)
	# str = json.dumps(data)
	# result = str.decode("unicode-escape").decode("unicode-escape")

	# with open(fileName, 'ab+') as f:
	# 	json.dump(data, f)
	# 	f.write('\n')

    # with open("data.txt", "w") as f:
    # 	f.write(json.dumps(data, ensure_ascii=False))

def getItem(name, whichBuild, url):
	print (url)

	soup = getSoupByUrl(url)
	desc = soup.find_all(id='desc')

	if desc.__len__() > 13:
		# room = Room(desc[1].text.split(' ')[0], desc[7].text.split(' ')[0], desc[9].text.split(' ')[0])
		# roomJson = json.dumps(room, default = obj_2_json, ensure_ascii=False)
		rowInfo = []
		rowInfo.append(whichBuild + "," + desc[1].text.split(' ')[0] + "," + desc[5].text.split(' ')[0] + "," + desc[7].text.split(' ')[0] + "," + desc[9].text.split(' ')[0] + "," + desc[11].text.split(' ')[0] + "," + desc[13].text.split(' ')[0])
		writeJson(rowInfo, name + ".json")
	else:
		print("length error:" + str(len(desc)))

def getAllRoom(name, whichBuild, url):
	soup = getSoupByUrl(url)

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
		getItem(name, whichBuild, href)
		print ("------------------")

	print(alldivs.__len__())

#楼盘中所有楼栋
def getProjectInfo(name, url):
	soup = getSoupByUrl(url)
	rowInfo = []
	# soup.find(attrs={"class":"cont_titlebg"})
	projectName = soup.find_all(id="newslist")[0].find_all("td")[1].text #TODO 存在空格
	print(type(projectName))
	print(projectName)
	infos = table = soup.find_all(id="Span1")[0].find_all("table")[0].find_all("td")
	for info in infos:
		if info.find("a") != None:
			url = "http://bjjs.zjw.beijing.gov.cn" + info.find("a").get("href")
			print(url)
			getAllRoom(name, rowInfo[0], url)
		print(info.text)
		rowInfo.append(info.text)
		if rowInfo.__len__() == 6:#每6项是一行
			# writeJson(rowInfo, name + "_" + rowInfo[0] + ".json")
			rowInfo = []
	print(rowInfo)

#地区内所有楼盘内容
for page in range(1):

	beijingUrl = "http://bjjs.zjw.beijing.gov.cn/eportal/ui?pageId=307678&isTrue=&currentPage=" + str(page+1) + "&pageSize=15"
	print(beijingUrl)
	soup = getSoupByUrl(beijingUrl)

	infos = soup.find_all("form")[1].find_all("table")[6].find_all("td")
	lastUrl = ""
	for index in range(infos.__len__()):
		tag = infos[index].find("a")
		if tag != None:
			rowInfo = []
			url = "http://bjjs.zjw.beijing.gov.cn" + tag.get("href")

			if(lastUrl != url):
				text = tag.text
				line = text + "," + url
				rowInfo.append(line)
				writeJson(rowInfo, "beijing.json") #多了一条0数据
				lastUrl = url
				getProjectInfo(text, url)








