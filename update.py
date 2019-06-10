import os
import markdown2
from pyquery import PyQuery as pq
import shutil

def ToHTML(markdown_file):
    split_file = markdown_file.split("\n")
    content = "\n".join(split_file[5:])
    html_content =  markdown2.markdown(content)
    return html_content

def GetInfo(markdown_file):
    split_file = markdown_file.split("\n")
    title = split_file[1].split(": ")[1].strip(" ").strip('"')
    date = split_file[2].split(": ")[1].strip(" ").strip("00:00:00")
    summary = split_file[3].split(": ")[1].strip(" ").strip('"')
    
    return (title, date, summary)

shutil.rmtree("_site")
os.mkdir("_site")
os.mkdir("_site/blog")
os.mkdir("_site/blog/posts")
shutil.copyfile("utils/style.css", "_site/blog/style.css")
shutil.copyfile("utils/style.css", "_site/style.css")
shutil.copytree("values/", "_site/values")



header = ""
footer = ""
with open("./utils/header.html", "r") as header_page:
    header = header_page.read()

with open("./utils/footer.html", "r") as footer_page:
    footer = footer_page.read()

with open("./index.html", "r") as main_page:
    current_page = pq(main_page.read())
    current_page(".content").prepend(header)
    current_page(".content").append(footer)
    with open("_site/index.html", "w") as writing_page:
        writing_page.write(str(current_page))
    
with open("./blog/index.html", "r") as blog_page:
    page = pq(blog_page.read())
    page(".content").prepend(header)

    post_format = ""
    with open("./utils/post_box.html", "r") as post_box:
        post_format = pq(post_box.read())


    for filename in sorted(os.listdir("./blog/posts/"), reverse=True):
        with open("./blog/posts/" + filename, "r") as blog_post:
            content = blog_post.read()
            (title, date, summary) = GetInfo(content)
            html_post = ToHTML(content)
            post_url = "posts/" + filename.split(".")[0] + ".html"
            post_format(".post_title").text(title)
            post_format(".post_title").attr("href", post_url)
            post_format(".post_date").text(date)
            post_format(".post_summary").text(summary)
            page(".content").append(str(post_format))
            with open("./_site/blog/posts/" + filename.split(".")[0] + ".html", "w") as final_post_page:
                post_page = ""
                with open("./utils/blog_post.html", "r") as post_page_format:
                    post_page = pq(post_page_format.read())
                post_page(".content").prepend(header)
                post_page(".header").append(title)
                post_page(".content").append(html_post)
                post_page(".content").append(footer)
                final_post_page.write(str(post_page))
            
    page(".content").append(footer)
    with open("./_site/blog/index.html", "w") as final_blog_page:
        final_blog_page.write(str(page))



            




