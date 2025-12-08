import { TextLink } from "../components/TextLink";


export default function OtherChristians() {

  return (
    <div className=" flex flex-col items-center justify-center">
      <main>
        <h1 className="on-white"> <br/> We Are The Most Religious Religion in America <br/></h1>
        <p className="on-white">
          According to <TextLink link="https://www.pewresearch.org/about/" text="Pew Research"></TextLink>, we
          <ul>
            <li><TextLink link="https://www.pewresearch.org/religion/2025/02/26/religious-attendance-and-congregational-involvement/pr_2025-02-26_religious-landscape-study_08-06/" text="Go "></TextLink> 
            <TextLink link="https://www.pewresearch.org/religion/2025/02/26/religious-attendance-and-congregational-involvement/pr_2025-02-26_religious-landscape-study_08-04/" text="to "></TextLink> 
            <TextLink link="https://www.pewresearch.org/religion/2025/02/26/religious-upbringing-and-childhood-education/pr_2025-02-26_religious-landscape-study_05-04/" text="church "></TextLink>
            way more often than any other religion in the USA. </li> <li> (Percentage points above the next highest group per survey question:
            <TextLink link="https://www.pewresearch.org/religion/2025/02/26/religious-attendance-and-congregational-involvement/pr_2025-02-26_religious-landscape-study_08-06/" text=" +9 "></TextLink> 
            <TextLink link="https://www.pewresearch.org/religion/2025/02/26/religious-attendance-and-congregational-involvement/pr_2025-02-26_religious-landscape-study_08-04/" text="+16 "></TextLink> 
            <TextLink link="https://www.pewresearch.org/religion/2025/02/26/religious-upbringing-and-childhood-education/pr_2025-02-26_religious-landscape-study_05-04/" text="+8) "></TextLink></li>

            <li><TextLink text="Read " link="https://www.pewresearch.org/religion/2025/02/26/prayer-and-other-religious-practices/pr_2025-02-26_religious-landscape-study_010-06/"></TextLink>
            <TextLink text="scriptures " link="https://www.pewresearch.org/religion/2025/02/26/prayer-and-other-religious-practices/pr_2025-02-26_religious-landscape-study_010-08/"></TextLink> 
            way more than any other religion</li>
            <li><TextLink text=" (+8 " link="https://www.pewresearch.org/religion/2025/02/26/prayer-and-other-religious-practices/pr_2025-02-26_religious-landscape-study_010-06/"></TextLink>
            <TextLink text="+10)" link="https://www.pewresearch.org/religion/2025/02/26/prayer-and-other-religious-practices/pr_2025-02-26_religious-landscape-study_010-08/"></TextLink></li>
            
            <li>The 
              <TextLink text=" Bible " link="https://www.pewresearch.org/religion/2025/02/26/importance-of-religion-and-the-bible/pr_2025-02-26_religious-landscape-study_07-04/"></TextLink>
              matters a lot to us, just barely less than to Evangelicals and historically black churches. We use the 
              <TextLink text=" KJV " link="https://www.churchofjesuschrist.org/study/scriptures/ot/dedication?lang=eng"></TextLink>
              with no modifications, except for the footnotes. We probably only missed the top spot 
              on this question because we divide our time evenly between four canonical books of scripture, 
              the Old Testament, New Testament, Book of Mormon, and the Doctrine and Covenants. Still, according to
              a separate Pew survey, we know the Bible better than most 
              <TextLink text=" Christians" link="https://www.pewresearch.org/religion/2019/07/23/what-americans-know-about-religion/pf_07-23-19_religiousknowledge-01-02-png/"></TextLink>.
              This contradicts the popular claim that "Mormons don't know the Bible". Many of the differences between us and
              mainstream Christianity is because we reject the creeds, and therefore don't have to hold to the biblical interpretation
              of the councils. 
            </li>
            <li>
              <TextLink text="(-4 " link="https://www.pewresearch.org/religion/2025/02/26/importance-of-religion-and-the-bible/pr_2025-02-26_religious-landscape-study_07-04/"></TextLink>and
              <TextLink text=" -1, based on number of questions asked/number answered correctly) " link="https://www.pewresearch.org/religion/2019/07/23/what-americans-know-about-religion/pf_07-23-19_religiousknowledge-01-02-png/"></TextLink></li>
          </ul>
        </p>
      </main>
    </div>
  )
}
