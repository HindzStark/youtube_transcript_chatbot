from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi

load_dotenv()

# url=input("Enter video url:")
# url="https://www.youtube.com/watch?v=RLtyhwFtXQA"
# url="https://www.youtube.com/watch?v=J5_-l7WIO_w&list=PLKnIA16_RmvaTbihpo4MtzVm4XOQa0ER0&index=17"


def get_video_id(url: str) -> str:
    
    parsed_url = urlparse(url)

    # Handle standard YouTube URL
    if "youtube.com" in parsed_url.netloc:
        query_params = parse_qs(parsed_url.query)

        if "v" in query_params:
            return query_params["v"][0]

    # Handle short YouTube URL
    if "youtu.be" in parsed_url.netloc:
        return parsed_url.path.lstrip("/")
    
    raise ValueError("Invalid YouTube URL")


# video_id=get_video_id(url)
# print(video_id)


def get_transcript_text(video_id: str) -> str:
    try:
        yt_instance = YouTubeTranscriptApi()
        transcript_languages_list = yt_instance.list(video_id)

        llm = ChatOpenAI(model="gpt-4o-mini")

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a translator. Translate the given text from {source_lang} to English. Only return the translated text."),
            ("human", "{text}")
        ])

        chain = prompt | llm

        # Try to get English transcript
        try:
            transcript = transcript_languages_list.find_transcript(["en"])
        except Exception:
            available_transcripts = list(transcript_languages_list)
            if not available_transcripts:
                raise Exception("No transcripts available")

            transcript = available_transcripts[0]

        transcript_language = transcript.language_code

        transcript_list = transcript.fetch()
        transcript_text = " ".join(item.text for item in transcript_list)

        #  Translate per chunk only if not English
        if transcript_language != "en":

            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=100
            )

            split_docs = splitter.create_documents([transcript_text])

            translated_parts = []   

            for doc in split_docs:
                result = chain.invoke({
                    "source_lang": transcript_language,
                    "text": doc.page_content
                })

                translated_parts.append(result.content)

            # Replace transcript_text completely
            transcript_text = " ".join(translated_parts)

        # IMPORTANT: always return transcript_text
        return transcript_text

    except Exception:
        raise Exception("Transcript not available")


def build_vector_store(transcript_text: str):
    # splitting complete trancript and storing in vector store
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200, 
        chunk_overlap=200
    )

    chunks = splitter.create_documents([transcript_text])
    embedding = OpenAIEmbeddings(model="text-embedding-3-small")
    vector_store = FAISS.from_documents(chunks, embedding)
    return vector_store


# input question
# question=input("Ask anything from the video:")

# result_length=int(input("Enter the legth of result you are expecting on a scale of 1-5 1(small),5(large):"))


def ask_question(vector_store, question: str, result_length: int):
    token = 100
    k = 3

    if result_length <= 1:
        token = 50
        k = 3
    elif result_length == 2:
        token = 100
        k = 5
    elif result_length == 3:
        token = 400
        k = 8
    elif result_length == 4:
        token = 700
        k = 10
    else:
        token = 1000
        k = 12

    model = ChatOpenAI(model="gpt-4o-mini", max_tokens=token)
    parser = StrOutputParser()

    # creating retriever
    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={"k": k}
    )

    # get all retrieved text together
    def getcontext(retrieved_text):
        context = " ".join(doc.page_content for doc in retrieved_text)
        return context

    # chain logic
    prompt = PromptTemplate(
        template="""
        You are a helpful assistant.
        Answer ONLY from the provided transcript context.
        If the context is insufficient, just say you don't know.

        {context}
        Question: {question}
        """,
        input_variables=["context", "question"]
    )

    parallel_chain = RunnableParallel({
        "context": retriever | RunnableLambda(getcontext),
        "question": RunnablePassthrough()
    })

    chain = parallel_chain | prompt | model | parser

    result = chain.invoke(question)

    return result


# print(result)


def load_video(video_url: str):
    video_id = get_video_id(video_url)
    transcript = get_transcript_text(video_id)
    vector_store = build_vector_store(transcript)
    return vector_store